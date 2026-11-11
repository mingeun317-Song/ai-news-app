"use client";

import { useActionState, useId, useRef, useState } from "react";
import { hexColor, isHexColor } from "@/lib/category-colors";
import { checkSlug, SLUG_MAX_LENGTH, SLUG_PATTERN } from "@/lib/category-slug";
import { createCategory, type CreateCategoryState } from "./actions";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const addButton = `inline-flex h-8 shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-dashed border-line px-3.5 text-sm font-medium text-muted transition-colors hover:border-accent hover:text-accent ${focusRing}`;
const inputClass =
  "h-9 w-full rounded-lg border border-line bg-surface px-3 text-sm outline-none focus:border-accent aria-invalid:border-danger disabled:opacity-60";
const secondaryButton = `inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-sm font-medium transition-colors hover:bg-subtle disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`;
const primaryButton = `inline-flex h-8 items-center gap-2 rounded-lg bg-accent px-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`;

/**
 * 카테고리 바. 필터 칩(children) 끝에 '+ 카테고리 추가' 버튼을 두고,
 * 누르면 작은 팝업(모달 `<dialog>`)으로 추가 폼을 띄운다(ui.md 5.2).
 */
export function AddCategory({
  defaultColor,
  children,
}: {
  defaultColor: string;
  children: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  // 팝업을 닫을 때마다 key를 바꿔 입력값과 오류를 지운다.
  const [formKey, setFormKey] = useState(0);
  const titleId = useId();

  return (
    <>
      {/* 모바일: 칩이 여러 줄로 쌓여 카드가 밀리지 않도록 한 줄로 두고 옆으로 넘긴다.
          화면 끝까지 넘길 수 있게 좌우 여백(-mx-4 px-4)을 상쇄하고, 포커스 테두리가 잘리지 않게 py-1을 둔다.
          sm 이상: 줄바꿈으로 모두 보여 준다. */}
      <nav
        aria-label="카테고리 필터"
        className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 py-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:py-0"
      >
        {children}
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={() => dialogRef.current?.showModal()}
          className={addButton}
        >
          <span aria-hidden>+</span> 카테고리 추가
        </button>
      </nav>

      {/* 모달 <dialog>는 Esc로 닫히고, 닫히면 포커스를 '+ 카테고리 추가' 버튼으로 돌려준다. */}
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClose={() => setFormKey((k) => k + 1)}
        // 팝업 바깥(배경)을 누르면 닫는다. 안쪽을 누르면 target이 안쪽 요소라 닫히지 않는다.
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-xl border border-line bg-surface p-0 text-foreground shadow-sm backdrop:bg-overlay"
      >
        <AddCategoryForm
          key={formKey}
          titleId={titleId}
          defaultColor={defaultColor}
          onClose={() => dialogRef.current?.close()}
        />
      </dialog>
    </>
  );
}

function AddCategoryForm({
  titleId,
  defaultColor,
  onClose,
}: {
  titleId: string;
  defaultColor: string;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  // 색 코드 입력창의 글자. 올바른 #rrggbb일 때만 색 선택기와 미리보기에 반영한다.
  const [colorText, setColorText] = useState(defaultColor);
  const color = isHexColor(colorText) ? colorText.toLowerCase() : null;

  const [state, formAction, pending] = useActionState<CreateCategoryState, FormData>(
    async (_prev, formData) => {
      const result = await createCategory(formData);
      if (result?.status === "done") onClose();
      return result;
    },
    null,
  );

  const errors = state?.status === "invalid" ? state.errors : {};
  // 형식이 틀린 값은 제출 전에 바로 알려 준다. 서버도 같은 규칙으로 다시 확인한다.
  const slugProblem = slug ? checkSlug(slug) : null;
  const slugError =
    slugProblem === "format"
      ? "영문 소문자, 숫자, 하이픈(-)만 쓸 수 있어요."
      : slugProblem === "reserved"
        ? "이 슬러그는 쓸 수 없어요."
        : errors.slug;
  const colorError =
    color === null ? "#으로 시작하는 6자리 색 코드를 입력해 주세요." : errors.color;
  const canSubmit =
    name.trim() !== "" &&
    description.trim() !== "" &&
    slug !== "" &&
    slugProblem === null &&
    color !== null;

  const ids = {
    name: `${titleId}-name`,
    slug: `${titleId}-slug`,
    slugHelp: `${titleId}-slug-help`,
    description: `${titleId}-description`,
    help: `${titleId}-help`,
    color: `${titleId}-color`,
  };
  const preview = color ? hexColor(color) : null;
  const previewLabel = name.trim() || "새 카테고리";

  return (
    <form action={formAction} className="flex flex-col gap-4 p-5">
      <h2 id={titleId} className="text-base font-semibold">
        새 카테고리
      </h2>

      <fieldset disabled={pending} className="flex flex-col gap-4">
        <Field label="이름" htmlFor={ids.name} error={errors.name}>
          <input
            id={ids.name}
            name="name"
            autoFocus
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 오픈소스 모델"
            aria-invalid={errors.name ? true : undefined}
            className={inputClass}
          />
        </Field>

        <Field label="슬러그" htmlFor={ids.slug} error={slugError}>
          <input
            id={ids.slug}
            name="slug"
            required
            value={slug}
            // 대문자와 공백은 흔한 실수라 바로 소문자·하이픈으로 바꿔 준다.
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
            placeholder="예: open-source-models"
            pattern={SLUG_PATTERN}
            maxLength={SLUG_MAX_LENGTH}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            aria-invalid={slugError ? true : undefined}
            aria-describedby={ids.slugHelp}
            className={`${inputClass} font-mono`}
          />
          <p id={ids.slugHelp} className="text-xs break-all text-muted">
            필터 주소: /dashboard?category={slug || "…"}
          </p>
        </Field>

        <Field label="설명" htmlFor={ids.description} error={errors.description}>
          <textarea
            id={ids.description}
            name="description"
            rows={3}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="예: 공개 가중치로 배포된 모델의 출시, 성능 비교, 라이선스 소식"
            aria-invalid={errors.description ? true : undefined}
            aria-describedby={ids.help}
            className="w-full resize-y rounded-lg border border-line bg-surface px-3 py-2 text-sm leading-relaxed outline-none focus:border-accent aria-invalid:border-danger disabled:opacity-60"
          />
          <p id={ids.help} className="text-xs break-keep text-muted">
            Claude가 기사를 분류할 때 이 설명을 기준으로 삼아요. 이후 수집하는 뉴스부터 적용돼요.
          </p>
        </Field>

        <Field label="색" htmlFor={ids.color} error={colorError}>
          <div className="flex items-center gap-2">
            <input
              type="color"
              aria-label="색 선택기"
              value={color ?? defaultColor}
              onChange={(e) => setColorText(e.target.value)}
              className="h-9 w-12 shrink-0 cursor-pointer rounded-lg border border-line bg-surface p-1 disabled:cursor-not-allowed"
            />
            <input
              id={ids.color}
              name="color"
              required
              value={colorText}
              onChange={(e) => setColorText(e.target.value.trim())}
              placeholder="#4f46e5"
              maxLength={7}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              aria-invalid={colorError ? true : undefined}
              className={`${inputClass} w-28 font-mono`}
            />
            {preview && (
              <span
                aria-hidden
                className="inline-flex h-7 min-w-0 items-center truncate rounded-full px-3 text-sm font-medium"
                style={preview.softStyle}
              >
                {previewLabel}
              </span>
            )}
          </div>
        </Field>
      </fieldset>

      {state?.status === "error" && (
        <p role="alert" className="text-xs text-danger">
          카테고리를 추가하지 못했어요. 다시 시도해 주세요.
        </p>
      )}

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} disabled={pending} className={secondaryButton}>
          취소
        </button>
        <button type="submit" disabled={!canSubmit || pending} className={primaryButton}>
          {pending && (
            <span
              aria-hidden
              className="size-4 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin"
            />
          )}
          {pending ? "추가하는 중…" : "추가하기"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

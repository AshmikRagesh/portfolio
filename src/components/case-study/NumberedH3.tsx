import { H3_CLASS } from "./constants";

/**
 * Numbered step heading used in Process and Solution sections.
 * Renders as:  "1. Title text"
 */
export default function NumberedH3({
  num,
  title,
}: {
  num: number;
  title: string;
}) {
  return (
    <h3 className={`${H3_CLASS} flex gap-[12px]`}>
      <span aria-hidden="true">{num}.</span>
      <span>{title}</span>
    </h3>
  );
}

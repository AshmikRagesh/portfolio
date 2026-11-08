/**
 * One numbered chapter of a case study: "01. Title" over the reading column.
 * Children are Copy and Visual blocks, in reading order. `num` should match the
 * chapter's position in the page's SECTIONS so the bottom pill agrees.
 */
export default function Chapter({
  id,
  num,
  title,
  children,
}: {
  id: string;
  num: number;
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="cs-chapter">
      <div className="cs-column">
        <h2 className="cs-h2">
          <span className="cs-number">
            {String(num).padStart(2, "0")}
            <span className="text-grape">.</span>
          </span>
          <span>{title}</span>
        </h2>
      </div>
      {children}
    </section>
  );
}

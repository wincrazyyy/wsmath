import type { CourseGroup, Courses as CoursesCopy, Package } from '@/content/schema';

import './courses-covered.css';

export interface CoursesCoveredProps {
  /** `pages.courses` — head copy, the group-course marker label, and the display-code map. */
  courses: CoursesCopy;
  /** `content.courseGroups` — the three trays' rows, authoritative. */
  courseGroups: readonly CourseGroup[];
  /**
   * `content.packages` — read only for `variants[].courseId`, which marks the
   * rows that are also sold as scheduled group courses. The mapping is data,
   * cross-checked at build: a stale id fails the build instead of silently
   * un-marking a row.
   */
  packages: readonly Package[];
}

/**
 * The tray shows the course name and its exam-board code in separate cells, but
 * `course-groups.json` stores the code inside the name (`Edexcel IAL Math
 * YMA01`) — that file is read-only, so the split happens here. Courses with no
 * exam-board code of their own (the five IBDP courses, IBMYP) take a display
 * code from `pages.courses.displayCodes`; their names are already code-free.
 */
function courseRow(
  course: CourseGroup['courses'][number],
  displayCodes: ReadonlyMap<string, string>,
): { readonly name: string; readonly code: string | null } {
  if (course.code === undefined) {
    return { name: course.name, code: displayCodes.get(course.id) ?? null };
  }
  const suffix = ` ${course.code}`;
  const name = course.name.endsWith(suffix) ? course.name.slice(0, -suffix.length) : course.name;
  return { name, code: course.code };
}

/**
 * COURSES COVERED — three ledger trays cut to one depth, absorbed into the
 * packages section as a block rather than a section of its own.
 *
 * The trays are the **legend for the four cards above them**, not a fifth
 * offer: the tray groups (IBDP 5 / A-Level 9 / IGCSE 7) do not match the sold
 * set (4 / 1 / 3), so every row that *is* also sold as a scheduled group course
 * carries a cast-brass diamond and, for screen readers, the sentence the
 * diamond stands for.
 *
 * The marker is a **margin mark** in the tray's own left padding, not a third
 * grid track: a track would auto-place the unmarked rows' code span into the
 * wrong column (the near-miss column drift `courses-covered.css` records by
 * name) and would tax the name column by ~23px at exactly the widths its
 * 38/32/30 split was tuned for. `.mvt-visually-hidden` is
 * `position:absolute !important`, so the hidden sentence is not auto-placed
 * into a track either — it consumes nothing, and it sits *before* the code span
 * so the `span:first-child` / `span:last-child` rules keep pointing at the name
 * and the code on marked and unmarked rows alike.
 *
 * The tray titles are `<h4>`: absorbed into `#mvt-s-packages`, an `<h3>` here
 * would be a sibling of the block heading that now contains it and of the four
 * plate headings — three levels of the argument collapsed onto one.
 *
 * The group flagged `emphasize` in `course-groups.json` (IBDP — the
 * merchandising priority) is the amethyst-flooded well; the other two are plain
 * lacquer wells with their codes struck in `--am-lit`.
 */
export function CoursesCovered({ courses, courseGroups, packages }: CoursesCoveredProps) {
  const displayCodes = new Map(courses.displayCodes.map((entry) => [entry.id, entry.code]));
  const groups = [...courseGroups].sort((a, b) => a.order - b.order);
  const groupCourseIds = new Set(
    packages.flatMap((pkg) =>
      (pkg.variants ?? []).flatMap((variant) => (variant.courseId === undefined ? [] : [variant.courseId])),
    ),
  );

  return (
    /* The published `#mvt-s-courses` DOM id moves with the block, so an inbound
       link or a bookmark now lands on the trays inside Packages instead of at
       the top of the page. The scroll-spy keys off `data-spy`, not the prefix,
       so two `mvt-s-` ids inside one section are harmless. */
    <div id="mvt-s-courses" className="mvt-covered">
      <div className="mvt-subhead">
        <p className="mvt-eyebrow mvt-rev mvt-rev--s">{courses.eyebrow}</p>
        <h3 className="mvt-h3 mvt-rev">{courses.title}</h3>
        <span className="mvt-rule mvt-rev mvt-rev--rule" aria-hidden="true" />
        <p className="mvt-head-sub mvt-lead mvt-rev mvt-rev--s">{courses.sub}</p>
      </div>

      <div className="mvt-courses">
        {groups.map((group) => (
          <div
            key={group.id}
            className={
              group.emphasize
                ? 'mvt-course mvt-course--ibdp mvt-well mvt-well--am mvt-rev'
                : 'mvt-course mvt-well mvt-rev'
            }
          >
            <div className="mvt-course-h">
              <h4 className="mvt-h3">{group.title}</h4>
              <p className="mvt-mu">{group.capLeft}</p>
            </div>
            <ul>
              {group.courses.map((course) => {
                const { name, code } = courseRow(course, displayCodes);
                const sold = groupCourseIds.has(course.id);
                return (
                  <li key={course.id}>
                    <span>
                      {sold ? <i className="mvt-groupmark" aria-hidden="true" /> : null}
                      {name}
                    </span>
                    {sold ? <span className="mvt-visually-hidden">{courses.groupMarkLabel}</span> : null}
                    {code === null ? <span /> : <span className="mvt-code">{code}</span>}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <p className="mvt-courses-legend mvt-mu mvt-dim mvt-rev mvt-rev--s">
        <i className="mvt-groupmark" aria-hidden="true" />
        {courses.groupMarkLabel}
      </p>
    </div>
  );
}

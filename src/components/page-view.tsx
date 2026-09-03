/**
 * The whole page, as one props-driven component.
 *
 * Rendered twice from two different trees:
 *
 *   - `src/app/page.tsx` — a Server Component, at build time, into static HTML;
 *   - `src/app/preview/preview-client.tsx` — a Client Component, in the browser,
 *     against a draft posted in from the editor (editor contract §3.3).
 *
 * That is why this file carries **no** `'use client'` directive and imports
 * nothing server-only: a `'use client'` here would force the whole page into the
 * client bundle on the real route, and a `node:fs` import anywhere below it
 * would break the preview. Content arrives as props — never imported.
 *
 * Document order: nav · main → hero · about · ribbon · packages · results ·
 * voices · faq · footer, then the fixed "Your plan" panel and the WhatsApp coin
 * (foundation-owned — no section ever renders a fixed element). A `.mvt-edge`
 * seam separates every adjacent pair.
 *
 * `courses` is no longer a section: the coverage trays were absorbed into
 * Packages, which now sells four paths and closes with the legend for them.
 * Nothing compensates for the vacated band — About ends on its journey pills
 * and the carmine ribbon is a stronger adjacency than About → a neutral
 * coverage list → Ribbon, on a page that is already very long.
 */
import { SiteFooter } from '@/components/layout/footer';
import { MvtRoot } from '@/components/layout/mvt-root';
import { Nav } from '@/components/layout/nav';
import { PlanProvider } from '@/components/layout/plan-panel/plan-context';
import { planOptionsFromPackages } from '@/components/layout/plan-panel/plan-options';
import { PlanPanel } from '@/components/layout/plan-panel/plan-panel';
import { WhatsAppCoin } from '@/components/layout/plan-panel/whatsapp-coin';
import { About } from '@/components/sections/about/about';
import { FaqSection } from '@/components/sections/faq/faq';
import { Hero } from '@/components/sections/hero/hero';
import { PackagesSection } from '@/components/sections/packages/packages';
import { ResultsSection } from '@/components/sections/results/results';
import { Ribbon } from '@/components/sections/ribbon/ribbon';
import { VoicesSection } from '@/components/sections/voices/voices';
import type { SectionMark } from '@/content/schema';
import type { SiteContent } from '@/lib/content';

/**
 * The sections this page composes must each have a nav marker available —
 * `parseContent` already guarantees every `settings.navSections` entry has a
 * marker; this asserts the composition's own expectations so a missing marker
 * fails loudly here rather than rendering a nav with a hole in it.
 */
const MARK_IDS = ['about', 'packages', 'results', 'voices', 'faq'] as const;

function assertMarks(marks: readonly SectionMark[]): void {
  const ids = new Set(marks.map((mark) => mark.id));
  const missing = MARK_IDS.filter((id) => !ids.has(id));
  if (missing.length > 0) {
    throw new Error(
      `pages.sectionMarks is missing the marker(s) ${missing.join(', ')}. Every section on the page needs one.`,
    );
  }
}

/** The 2px machined seam between sections (artifact `.mvt-edge`). */
function Edge() {
  return <div className="mvt-edge" aria-hidden="true" />;
}

export interface PageViewProps {
  /** The validated, token-resolved content set. Loaded once, at the boundary above. */
  content: SiteContent;
}

export function PageView({ content }: PageViewProps) {
  const { settings, pages, whatsappPrefills } = content;
  assertMarks(pages.sectionMarks);
  const phone = settings.contact.whatsappPhone;
  /* `derivePricing` is not called here: every figure the section shows arrives
     through the token system, which runs it once inside `buildTokenMap`. */
  const planOptions = planOptionsFromPackages(content.packages, whatsappPrefills);

  return (
    <MvtRoot skipLabel={pages.nav.skipLabel}>
      <PlanProvider options={planOptions} defaultKey={pages.packagesPage.plan.defaultPackageId}>
        <Nav
          nav={pages.nav}
          marks={pages.sectionMarks}
          logo={settings.brand.logo}
          phone={phone}
          message={whatsappPrefills[pages.nav.ctaKey]}
        />

        <main className="mvt-main">
          <Hero
            hero={pages.hero}
            tutoringHours={settings.stats.tutoringHours}
            phone={phone}
            message={whatsappPrefills[pages.hero.ctaKey]}
          />
          <Edge />

          <About about={pages.about} />
          <Edge />

          <Ribbon ribbon={pages.ribbon} phone={phone} message={whatsappPrefills[pages.ribbon.ctaKey]} />
          <Edge />

          <PackagesSection
            page={pages.packagesPage}
            packages={content.packages}
            courses={pages.courses}
            courseGroups={content.courseGroups}
            iaCourse={content.iaCourse}
            phone={phone}
            prefills={whatsappPrefills}
          />
          <Edge />

          <ResultsSection
            page={pages.results}
            programmes={content.programmes}
            students={content.students}
            gradeScales={content.gradeScales}
            schools={content.schools}
            phone={phone}
            prefills={whatsappPrefills}
          />
          <Edge />

          <VoicesSection
            voices={pages.voices}
            testimonials={content.testimonials}
            phone={phone}
            prefills={whatsappPrefills}
          />
          <Edge />

          <FaqSection copy={pages.faqPage} faqs={content.faqs} phone={phone} prefills={whatsappPrefills} />
        </main>

        <Edge />
        <SiteFooter copy={pages.footer} legal={pages.legal} settings={settings} prefills={whatsappPrefills} />

        {/* the fixed pair — replacement choreography lives in plan-panel/ */}
        <PlanPanel phone={phone} label={pages.packagesPage.plan.label} ctaLabel={pages.packagesPage.plan.ctaLabel} />
        <WhatsAppCoin
          phone={phone}
          message={whatsappPrefills[pages.nav.ctaKey]}
          ctaKey={pages.nav.ctaKey}
          ariaLabel={pages.nav.ctaLabel}
        />
      </PlanProvider>
    </MvtRoot>
  );
}

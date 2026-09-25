import { ODBL_URL, OPEN_FOOD_FACTS_URL } from "./site.ts";

export interface MethodSource {
  tag: string;
  title: string;
  url: string;
  /** What PureScan uses it for. */
  use: string;
}

export const METHOD_SOURCES: readonly MethodSource[] = [
  {
    tag: "OFF",
    title: "Open Food Facts",
    url: OPEN_FOOD_FACTS_URL,
    use: "Product names, ingredients, nutrition and NOVA group.",
  },
  {
    tag: "ODbL",
    title: "Open Database Licence",
    url: ODBL_URL,
    use: "The licence Open Food Facts data is shared under.",
  },
  {
    tag: "DHSC",
    title: "Front of pack nutrition labelling guidance",
    url: "https://www.gov.uk/government/publications/front-of-pack-nutrition-labelling-guidance",
    use: "The UK traffic-light thresholds for fat, saturates, sugars and salt.",
  },
  {
    tag: "HMRC",
    title: "Soft Drinks Industry Levy",
    url: "https://www.gov.uk/guidance/check-if-your-drink-is-liable-for-the-soft-drinks-industry-levy",
    use: "The sugar bands for drinks.",
  },
  {
    tag: "Study",
    title: "Monteiro et al., Public Health Nutrition (2019): ultra-processed foods and how to identify them",
    url: "https://doi.org/10.1017/S1368980018003762",
    use: "The NOVA processing scale.",
  },
  {
    tag: "SACN",
    title: "Processed foods and health (2025)",
    url: "https://assets.publishing.service.gov.uk/media/67ea98e4ba01abac8e9fe963/sacn-processed-foods-review.pdf",
    use: "The UK expert committee’s view of the evidence on processing.",
  },
  {
    tag: "EFSA",
    title: "Food additives",
    url: "https://www.efsa.europa.eu/en/topics/topic/food-additives",
    use: "Safety evaluations behind many additive ratings.",
  },
  {
    tag: "FSA",
    title: "Food additives",
    url: "https://www.food.gov.uk/safety-hygiene/food-additives",
    use: "How additives are approved and labelled in the UK.",
  },
  {
    tag: "IARC",
    title: "IARC Monographs",
    url: "https://monographs.iarc.who.int/",
    use: "Hazard classifications referenced in some ratings.",
  },
  {
    tag: "WHO",
    title: "Guideline: sugars intake for adults and children",
    url: "https://www.who.int/publications/i/item/9789241549028",
    use: "Referenced in ratings for added sugars.",
  },
];

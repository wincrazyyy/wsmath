import packagesContent from "./json/packages.json";

export type PackagesData = typeof packagesContent;
export type PrivateConfig = PackagesData["private"];
export type GroupConfig = PackagesData["group"];
export type ComparisonConfig = PackagesData["comparison"];



export const getClasses = (classes: any) =>
  classes
    .filter((item: string) => item !== "")
    .join(" ")
    .trim();

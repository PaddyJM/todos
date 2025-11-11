import { format, isValid, parseISO } from "date-fns";

export const formatDate = (dateString: string) => {
  try {
    let date = new Date(dateString);
    if (!isValid(date)) {
      date = parseISO(dateString);
    }
    if (!isValid(date)) {
      return "Invalid date";
    }
    return format(date, "p, MM/dd/yyyy");
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return "Invalid date";
  }
};


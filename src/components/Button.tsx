import React from "react";
import styles from "../styles/modules/button.module.scss";
import { getClasses } from "../utils/getClasses";

const buttonTypes = {
  primary: "primary",
  secondary: "secondary",
  center: "center",
};

function Button({
  type,
  variant = "primary",
  children,
  ...rest
}: {
  type: "submit" | "button";
  variant?: "primary" | "secondary" | "center";
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type={type === "submit" ? "submit" : "button"}
      className={getClasses([
        styles.button,
        styles[`button--${buttonTypes[variant]}`],
      ])}
      {...rest}
    >
      {children}
    </button>
  );
}

function SelectButton({
  children,
  id,
  ...rest
}: {
  children: React.ReactNode;
  id: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  value: string;
}) {
  return (
    <select
      id={id}
      className={getClasses([styles.button, styles.button__select])}
      {...rest}
    >
      {children}
    </select>
  );
}

export { SelectButton };
export default Button;

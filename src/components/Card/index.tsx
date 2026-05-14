export type CardProps = {
  title: string;
  amount: number;
  description: string;
  tone: "blue" | "yellow" | "green" | "teal";
};

export const Card = ({ title, amount, description, tone }: CardProps) => {
  const toneClasses = {
    blue: "border-primary text-primary",
    yellow: "border-warning text-warning",
    green: "border-success text-success",
    teal: "border-secondary text-secondary",
  }[tone];

  return (
    <div
      className={`bg-white rounded-md min-h-34 flex flex-col justify-between border-l-4 ${toneClasses}`}
    >
      <div className="px-6 pt-5">
        <span className="text-base font-medium leading-4 text-title">
          {title}
        </span>
      </div>

      <div className="px-6 pb-5">
        <strong className={`text-4xl font-semibold ${toneClasses}`}>
          {amount}
        </strong>
        <p className="mt-1 text-sm text-table-header">{description}</p>
      </div>
    </div>
  );
};

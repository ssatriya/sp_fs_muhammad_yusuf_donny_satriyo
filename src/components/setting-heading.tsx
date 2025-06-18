type Props = {
  title: string;
  description: string;
};

const SettingHeading = ({ title, description }: Props) => {
  return (
    <div className="mb-4">
      <h3 className="mb-0.5 text-base font-medium tracking-tight">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
};

export default SettingHeading;

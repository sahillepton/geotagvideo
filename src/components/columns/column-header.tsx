const ColumnHeader = ({
  header,
  style,
}: {
  header: string;
  style?: React.CSSProperties;
}) => {
  return <span style={style}>{header}</span>;
};

export default ColumnHeader;

const TextTruncate = ({
  text,
  maxLength = 20,
}: {
  text: string;
  maxLength?: number;
}) => {
  return (
    <div className="flex items-center justify-center">
      <span
        title={text}
        className="w-20 text-center text-xs font-semibold truncate rounded px-1 py-0.5 text-[#11181c] dark:text-white"
      >
        {text.length > maxLength ? text.slice(0, maxLength) + "..." : text}
      </span>
    </div>
  );
};

export default TextTruncate;

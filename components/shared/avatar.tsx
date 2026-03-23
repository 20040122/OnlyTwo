type AvatarProps = {
  name: string;
};

export default function Avatar({ name }: AvatarProps) {
  const fallback = name.slice(0, 1).toUpperCase();

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950 text-sm font-semibold text-white">
      {fallback}
    </div>
  );
}

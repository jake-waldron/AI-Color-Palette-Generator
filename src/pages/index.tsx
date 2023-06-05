import Head from "next/head";
import { useState } from "react";

async function getColors(input: string) {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input }),
  });
  const data = await res.json();
  console.log(res.status);
  console.log(data);
  if (res.status !== 200) throw new Error(data.error || "Something went wrong");

  if (data.code === "ERROR") throw new Error(data.description);

  const { colors } = data;
  return colors;
}

export default function Home() {
  const [theme, setTheme] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [colors, setColors] = useState([]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const userInput = formData.get("userInput");
    setIsLoading(true);
    try {
      const colors = await getColors(userInput as string);
      setTheme(userInput as string);
      setColors(colors);
    } catch (err) {
      setColors([]);
      alert(err);
    }
    setIsLoading(false);
  }

  return (
    <main className="min-w-screen min-h-screen bg-gradient-to-br from-cyan-600 to-cyan-300">
      <Head>
        <title>AI Color Palette Generator</title>
      </Head>
      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center ">
        {isLoading ? (
          <Loading />
        ) : (
          <UserInput handleSubmit={handleSubmit} currentTheme={theme} />
        )}
      </div>
      {colors && <Background colors={colors} />}
    </main>
  );
}

function UserInput({
  handleSubmit,
  currentTheme,
}: {
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  currentTheme: string;
}) {
  return (
    <form className={`z-50 mb-4 flex h-12`} onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder={currentTheme ? currentTheme : "Color Palette Theme"}
        className={`h-12 rounded-l-lg border border-r-0 border-gray-300 bg-slate-50 p-2`}
        name="userInput"
      />
      <button className="h-full rounded-r-lg bg-lime-200 p-2 disabled:opacity-50">
        Generate
      </button>
    </form>
  );
}

function Loading() {
  return (
    <div className={`rounded-xl bg-slate-50`}>
      <p className="p-4 ">Generating Color Palette...</p>
    </div>
  );
}

function Background({
  colors,
}: {
  colors: { code: string; description: string }[];
}) {
  return (
    <div
      className={`z-0 flex min-h-full min-w-full items-center justify-center`}
    >
      {colors.map((color) => (
        <ColorPanel color={color} key={color.code} />
      ))}
    </div>
  );
}

function ColorPanel({
  color,
}: {
  color: { code: string; description: string };
}) {
  const [isHovering, setIsHovering] = useState<boolean>(false);
  return (
    <div
      style={{ backgroundColor: color.code }}
      className={`flex min-h-screen w-full flex-col items-center justify-end text-center hover:cursor-pointer`}
      onClick={() => navigator.clipboard.writeText(color.code)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      title="Click to copy color code"
    >
      {isHovering && (
        <div className="text-shadow m-4  rounded-xl p-4 text-white">
          <p className="mx-4 py-4 text-xl drop-shadow-sm">
            {color.description}
          </p>
          <p className="justify-self-end py-4 text-2xl drop-shadow-sm">
            {color.code.toUpperCase()}
          </p>
        </div>
      )}
    </div>
  );
}

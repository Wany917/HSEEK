import type { CustomFlowbiteTheme } from "flowbite-react";
import { Button, Flowbite } from "flowbite-react";

// outline or filled button
const customTheme: CustomFlowbiteTheme = {
  button: {
    color: {
        primary: "bg-blue-500 hover:bg-blue-600",
        secondary: "bg-blue-700 hover:bg-blue-800",
        gray: "bg-gray-500 hover:bg-gray-600",
    },

    outline: {
        color: {
            gray: "border border-gray-500 text-gray-500 hover:bg-gray-100",
        },
    }, 
  },
};

export default function HButton({ name, color, outline}: { name: string, color: string, outline?: boolean}) {
  return (
    <Flowbite theme={{ theme: customTheme }}>
      <Button color={color} className="px-10 m-5 rounded-md font-thin" outline={outline} > {name} </Button>
    </Flowbite>
  );
}
import type { CustomFlowbiteTheme } from "flowbite-react";
import { Flowbite, Button } from "flowbite-react";

// Définition du thème personnalisé
const customTheme: CustomFlowbiteTheme = {
  button: {
    color: {
      primary: "bg-blue-500 hover:bg-blue-600",
      secondary: "bg-blue-700 hover:bg-blue-800",
    },
  },
};

// Props pour le composant WideButton
interface WideButtonProps {
  name: string;
  color: 'primary' | 'secondary';
}

// Composant WideButton utilisant le thème personnalisé
const WideButton: React.FC<WideButtonProps> = ({ name, color }) => {
  return (
    <Flowbite theme={{ theme: customTheme }}>
      <Button color={color} className="px-20 m-5 rounded-md font-thin text-white">
        {name}
      </Button>
    </Flowbite>
  );
};

export default WideButton;

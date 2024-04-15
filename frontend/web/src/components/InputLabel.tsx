import type { CustomFlowbiteTheme } from "flowbite-react";
import { FloatingLabel } from "flowbite-react";

export default function InputLabel({name} : {name: string}) {
    return ( 
    <div className=" w-1/6">
        <FloatingLabel variant="outlined" label={name} />
    </div>
    );
}
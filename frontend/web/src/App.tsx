"use client";

import WideButton from "./components/WideButton";
import InputLabel from "./components/InputLabel";
import { Button } from "flowbite-react";

function App() {
  return (
    <div>
      <p>Custom test</p>
      <WideButton name="Sign In" color="secondary" />
      <WideButton name="Create Account" color="primary" />
      <InputLabel name="username" />
      <InputLabel name="password" />
      <Button color="gray" className="px-20 m-5 rounded-md font-thin text-white hover:bg-gray-500" outline> Cancel </Button>
      <Button color="secondary" className="px-20 m-5 rounded-md font-thin text-white"> Verify </Button>
    </div>
  );
}

export default App;

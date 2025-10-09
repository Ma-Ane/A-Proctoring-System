import { Outlet } from "react-router-dom";
import './App.css'
import MenuBar from "./components/MenuBar";

export default function App() {
  return (
    <div className="flex h-screen">
      <MenuBar className="flex-[1]"/>

      <main className="bg-background flex-[4]">
        <Outlet />
      </main>

    </div>
  );
}

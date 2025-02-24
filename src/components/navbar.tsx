import { Link } from "react-router-dom";
type ElementLinkProps = {
  label: string
  to: string
}

interface NavBarProps {
  children: ElementLinkProps[]
} 
export default function NavBar({ children }: NavBarProps) {
  return (
    <nav className="bg-blue-500 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-white text-2xl font-bold">Room Manager</h1>
        </div>
        <div>
          <ul className="flex space-x-4">
            {children.map((child) => (
              <li key={child.to}>
                <Link to={child.to} className="text-white">{child.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
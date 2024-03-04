import { useState, FC, useEffect } from 'react';
import api from '../../api';
import './styles.css';
import { useNavigate } from 'react-router-dom';

interface IBackendHealth {
  [key: string]: string;
}

const Navbar: FC = () => {

  const [isLoading, setIsLoading] = useState(true);
  const [backendHealth, setBackendHealth] = useState<IBackendHealth>({});
  const navigate = useNavigate();

  const checkHealth = async () => {
    try {
      setIsLoading(true);
      const data = await api.health.check();
      setBackendHealth(data);
    } catch (error) {
      console.error(error);
      setBackendHealth({ error: "Error" });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    checkHealth();
  }, []);

  const handleClick = (event: any) => {
    const name = event.target.name;
    navigate(name);
  }
    
  const pages = [
    { name: "home", label: "Pipelines" },
    { name: "add", label: "New" }
  ];

  return (
    <nav className="navbar-container">
      <div className="navbar-menu">
        {pages.map((page, index) => (
          <button key={index} name={page.name} onClick={handleClick}>{page.label}</button>
        ))}
      </div>
      <div className="navbar-status">
        {isLoading && <p>Loading...</p>}
        {backendHealth && Object.keys(backendHealth).length > 0 &&  
          Object.keys(backendHealth).map((key: string, index: number) => (
            <div className='navbar-status-item' key={index}>{" "+key}: {backendHealth[key]}  </div>
          ))
        }
      </div>
    </nav>
  );
};

export default Navbar;
import { useState, FC, useEffect } from 'react';
import api from '../../api';
import './styles.css';
import { useNavigate } from 'react-router-dom';
import { FRONTEND_URL, NEW_AUDIO_FOLDER_NAME, PREFECT_UI_URL } from '../../constants';

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

  const handleVisitPrefect = () => {
    const url = `${PREFECT_UI_URL}`;
    window.open(url, '_blank');
  }

  const handleVisitFileBrowser = () => {
    const url = `${FRONTEND_URL}/${NEW_AUDIO_FOLDER_NAME}/`;
    window.open(url, '_blank');
  }

  const pages = [
    { name: "home", label: "Pipelines" },
  ];

  return (
    <nav className="navbar-container">
      <div className="navbar-menu">
        {pages.map((page, index) => (
          <button className='navbar-status-item' key={index} name={page.name} onClick={handleClick}>{page.label}</button>
        ))}
        <button className='navbar-status-item' onClick={handleVisitPrefect}>Prefect UI</button>
        <button className='navbar-status-item' onClick={handleVisitFileBrowser}>Add file</button>
      </div>
      <div className="navbar-status">
        {isLoading && <p>Loading...</p>}
        {backendHealth && Object.keys(backendHealth).length > 0 &&
          Object.keys(backendHealth).map((key: string, index: number) => (
            <div className='navbar-status-item' key={index}>{" " + key}: {backendHealth[key]}  </div>
          ))
        }
      </div>
    </nav>
  );
};

export default Navbar;
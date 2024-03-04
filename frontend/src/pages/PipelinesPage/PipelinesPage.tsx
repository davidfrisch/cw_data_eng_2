import { useEffect, useState } from "react";
import api from "../../api";



export default function PipelinesPage() {

  const [pipelines, setPipelines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);


  async function getPipelines() {
    try {
      setIsLoading(true);
      const response = await api.pipelines.getAll();
      console.log(response.data);
      setPipelines(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getPipelines();
  }, []);

  return (
    <div>PipelinesPage</div>
  )
}
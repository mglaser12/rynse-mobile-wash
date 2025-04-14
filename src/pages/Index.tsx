
import { Navigate } from "react-router-dom";

const Index = () => {
  // Simply redirect to the auth page
  return <Navigate to="/auth" />;
};

export default Index;

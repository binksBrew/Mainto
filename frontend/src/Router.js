import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';

function AppRouter() {
  return (
    <Router>
      <Routes> {/* Use Routes instead of Switch */}
        <Route path="/signin" element={<SignIn />} /> {/* Use element prop */}
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;

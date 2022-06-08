import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className='nav'>
      <h1 className='navbar-title'>Trivia</h1>
      <ul>
        <li>
          <Link to='/leaderboard'>Leaderboard</Link>
        </li>
        <li>
          <Link to='/'>Trivia Home</Link>
        </li>
        <li>
          <a href='/'>Logout</a>
        </li>
      </ul>
    </nav>
  );
}

export function Navbar1() {
  return (
    <nav className='nav'>
      <h1 className='navbar-title'>Trivia</h1>
      <ul>
        <li>
          <Link to='/leaderboard'>Leaderboard</Link>
        </li>
      </ul>
    </nav>
  );
}

export function Navbar3() {
  return (
    <nav className='nav'>
      <h1 className='navbar-title'>Trivia</h1>
      <ul>
        <li>
          <Link to='/'>Trivia</Link>
        </li>
        <li>
          <a href='/'>Logout</a>
        </li>
      </ul>
    </nav>
  );
}

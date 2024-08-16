// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import LandingPage from './components/LandingPage';
import RegisterPage from './components/RegisterPage';
import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage';
import UserPage from './components/UserPage';

const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_ANON_KEY');

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={LandingPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/login" component={LoginPage} />
        <PrivateRoute path="/home" component={HomePage} />
        <PrivateRoute path="/user" component={UserPage} />
      </Switch>
    </Router>
  );
}

function PrivateRoute({ component: Component, ...rest }) {
  return (
    <Route
      {...rest}
      render={(props) =>
        supabase.auth.user() ? (
          <Component {...props} />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
}

export default App;

// components/LandingPage.js
import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div>
      <h1>Welcome to Cybersecurity Hub</h1>
      <p>Protect your digital assets with our cutting-edge solutions.</p>
      <Link to="/register">Sign Up</Link>
      <Link to="/login">Login</Link>
    </div>
  );
}

export default LandingPage;

// components/RegisterPage.js
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_ANON_KEY');

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [redeemCode, setRedeemCode] = useState('');
  const history = useHistory();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { user, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      await supabase.from('users').insert([
        { id: user.id, name, redeem_code: redeemCode },
      ]);

      history.push('/home');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        type="text"
        placeholder="Redeem Code"
        value={redeemCode}
        onChange={(e) => setRedeemCode(e.target.value)}
      />
      <button type="submit">Register</button>
    </form>
  );
}

export default RegisterPage;

// components/LoginPage.js
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_ANON_KEY');

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const history = useHistory();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.signIn({ email, password });
      if (error) throw error;
      history.push('/home');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  );
}

export default LoginPage;

// components/HomePage.js
import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_ANON_KEY');

function HomePage() {
  const [redeemCode, setRedeemCode] = useState('');
  const history = useHistory();

  useEffect(() => {
    fetchUserData();
  }, []);

  async function fetchUserData() {
    const user = supabase.auth.user();
    if (user) {
      const { data, error } = await supabase
        .from('users')
        .select('redeem_code')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
      } else {
        setRedeemCode(data.redeem_code);
      }
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    history.push('/');
  }

  return (
    <div>
      <nav>
        <button onClick={handleLogout}>Logout</button>
        <Link to="/user">User Page</Link>
      </nav>
      <h1>Welcome to Your Cybersecurity Dashboard</h1>
      <p>Your Redeem Code: {redeemCode}</p>
    </div>
  );
}

export default HomePage;

// components/UserPage.js
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_ANON_KEY');

function UserPage() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  async function fetchUserData() {
    const user = supabase.auth.user();
    if (user) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
      } else {
        setUserData(data);
      }
    }
  }

  if (!userData) return <div>Loading...</div>;

  return (
    <div>
      <h1>User Profile</h1>
      <p>Name: {userData.name}</p>
      <p>Email: {userData.email}</p>
      <p>Redeem Code: {userData.redeem_code}</p>
    </div>
  );
}

export default UserPage;

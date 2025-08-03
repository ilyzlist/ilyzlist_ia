// app/components/ChildProfiles.js
import React, { useState, useEffect } from 'react';
import { getChildProfiles, searchChildProfiles } from '../api/childProfiles';
import { useAuth } from '../context/AuthContext';

const ChildProfiles = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      if (user) {
        const data = await getChildProfiles(user.id);
        setProfiles(data);
        setLoading(false);
      }
    };
    
    fetchProfiles();
  }, [user]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    const results = await searchChildProfiles(user.id, searchQuery);
    setProfiles(results);
    setLoading(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="child-profiles-container">
      <div className="search-bar">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search children..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
      </div>

      <div className="profiles-grid">
        {profiles.length > 0 ? (
          profiles.map((profile) => (
            <div key={profile.id} className="profile-card">
              <div className="avatar">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.name} />
                ) : (
                  <div className="default-avatar">{profile.name.charAt(0)}</div>
                )}
              </div>
              <h3>{profile.name}</h3>
              <p>Age: {profile.age} years</p>
              <a href={`/reports/${profile.id}`} className="reports-button">
                See Reports
              </a>
            </div>
          ))
        ) : (
          <p>No child profiles found</p>
        )}
      </div>
    </div>
  );
};

export default ChildProfiles;

import React from 'react';

const AICoachPage = () => {
  return (
    <div className="page ai-coach-page">
      <h1>Generowanie Planu przez AI-Coacha</h1>
      <form>
        <label>Twój cel:</label>
        <input type="text" placeholder="Np. schudnąć 5kg" />
        <button type="submit">Generuj Plan</button>
      </form>
    </div>
  );
};

export default AICoachPage;

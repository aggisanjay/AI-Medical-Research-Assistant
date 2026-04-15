import React, { useState } from 'react';

function StructuredInput({ onSubmit, isLoading }) {
  const [form, setForm] = useState({
    patientName: '',
    disease: '',
    query: '',
    location: ''
  });

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.disease && !form.query) return;
    onSubmit({
      ...form,
      isStructured: true
    });
    setForm(prev => ({ ...prev, query: '' }));
  };

  return (
    <form className="structured-input-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Patient Name</label>
        <input
          type="text"
          placeholder="e.g., John Smith"
          value={form.patientName}
          onChange={handleChange('patientName')}
        />
      </div>
      <div className="form-group">
        <label>Disease of Interest *</label>
        <input
          type="text"
          placeholder="e.g., Parkinson's Disease"
          value={form.disease}
          onChange={handleChange('disease')}
        />
      </div>
      <div className="form-group">
        <label>Specific Query</label>
        <input
          type="text"
          placeholder="e.g., Deep Brain Stimulation"
          value={form.query}
          onChange={handleChange('query')}
        />
      </div>
      <div className="form-group">
        <label>Location</label>
        <input
          type="text"
          placeholder="e.g., Toronto, Canada"
          value={form.location}
          onChange={handleChange('location')}
        />
      </div>
      <button
        type="submit"
        className="structured-submit-btn"
        disabled={isLoading || (!form.disease && !form.query)}
      >
        {isLoading ? '🔬 Researching...' : '🔍 Search Research'}
      </button>
    </form>
  );
}

export default StructuredInput;

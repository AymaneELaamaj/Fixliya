// src/components/admin/forms/LocalForm.jsx
import React, { useState, useEffect } from 'react';
import { LOCAL_TYPES, COMMON_AREA_CATEGORIES } from '../../../services/localService';

/**
 * Formulaire de création/modification de local
 * Optimisé pour mobile avec design responsive
 */
export default function LocalForm({ onSubmit, onCancel, initialData = null, isEdit = false }) {
  const [formData, setFormData] = useState({
    name: '',
    type: LOCAL_TYPES.BUILDING,
    description: '',
    // Pour les bâtiments
    totalRooms: '',
    floors: '',
    // Pour les espaces communs
    category: '',
    capacity: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Charger les données initiales en mode édition
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        type: initialData.type || LOCAL_TYPES.BUILDING,
        description: initialData.description || '',
        totalRooms: initialData.totalRooms || '',
        floors: initialData.floors || '',
        category: initialData.category || '',
        capacity: initialData.capacity || ''
      });
    }
  }, [initialData]);

  // Gestion des changements
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validation du formulaire
  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Le nom est requis";
    }

    if (formData.type === LOCAL_TYPES.BUILDING) {
      if (!formData.totalRooms || formData.totalRooms <= 0) {
        newErrors.totalRooms = "Nombre de chambres invalide";
      }
      if (!formData.floors || formData.floors <= 0) {
        newErrors.floors = "Nombre d'étages invalide";
      }
    }

    if (formData.type === LOCAL_TYPES.COMMON_AREA) {
      if (!formData.category) {
        newErrors.category = "La catégorie est requise";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Préparer les données selon le type
      const dataToSubmit = {
        name: formData.name.trim(),
        type: formData.type,
        description: formData.description.trim(),
        ...(formData.type === LOCAL_TYPES.BUILDING && {
          totalRooms: parseInt(formData.totalRooms),
          floors: parseInt(formData.floors)
        }),
        ...(formData.type === LOCAL_TYPES.COMMON_AREA && {
          category: formData.category,
          capacity: formData.capacity ? parseInt(formData.capacity) : null
        })
      };

      await onSubmit(dataToSubmit);
    } catch (error) {
      console.error("Erreur soumission formulaire:", error);
      setErrors({ submit: error.message || "Une erreur est survenue" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="local-form">
      <div className="form-header">
        <h3>{isEdit ? '✏️ Modifier le Local' : '➕ Nouveau Local'}</h3>
      </div>

      {/* Erreur générale */}
      {errors.submit && (
        <div className="alert alert-error">
          ⚠️ {errors.submit}
        </div>
      )}

      {/* Type de local */}
      <div className="form-group">
        <label htmlFor="type">Type de local *</label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          className={errors.type ? 'error' : ''}
          disabled={isEdit} // Ne pas changer le type en édition
        >
          <option value={LOCAL_TYPES.BUILDING}>🏢 Bâtiment/Résidence</option>
          <option value={LOCAL_TYPES.COMMON_AREA}>🏛️ Espace Commun</option>
        </select>
        {errors.type && <span className="error-message">{errors.type}</span>}
      </div>

      {/* Nom du local */}
      <div className="form-group">
        <label htmlFor="name">Nom du local *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder={formData.type === LOCAL_TYPES.BUILDING ? "Ex: Bâtiment A" : "Ex: Salle d'étude principale"}
          className={errors.name ? 'error' : ''}
        />
        {errors.name && <span className="error-message">{errors.name}</span>}
      </div>

      {/* Champs spécifiques aux bâtiments */}
      {formData.type === LOCAL_TYPES.BUILDING && (
        <>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="floors">Nombre d'étages *</label>
              <input
                type="number"
                id="floors"
                name="floors"
                value={formData.floors}
                onChange={handleChange}
                placeholder="Ex: 5"
                min="1"
                className={errors.floors ? 'error' : ''}
              />
              {errors.floors && <span className="error-message">{errors.floors}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="totalRooms">Nombre de chambres *</label>
              <input
                type="number"
                id="totalRooms"
                name="totalRooms"
                value={formData.totalRooms}
                onChange={handleChange}
                placeholder="Ex: 100"
                min="1"
                className={errors.totalRooms ? 'error' : ''}
              />
              {errors.totalRooms && <span className="error-message">{errors.totalRooms}</span>}
            </div>
          </div>
        </>
      )}

      {/* Champs spécifiques aux espaces communs */}
      {formData.type === LOCAL_TYPES.COMMON_AREA && (
        <>
          <div className="form-group">
            <label htmlFor="category">Catégorie *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={errors.category ? 'error' : ''}
            >
              <option value="">-- Sélectionner --</option>
              {COMMON_AREA_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <span className="error-message">{errors.category}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="capacity">Capacité (optionnel)</label>
            <input
              type="number"
              id="capacity"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              placeholder="Nombre de personnes"
              min="1"
            />
          </div>
        </>
      )}

      {/* Description */}
      <div className="form-group">
        <label htmlFor="description">Description (optionnel)</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Ajoutez des détails supplémentaires..."
          rows="3"
        />
      </div>

      {/* Boutons d'action */}
      <div className="form-actions">
        <button 
          type="button" 
          onClick={onCancel} 
          className="btn btn-secondary"
          disabled={isSubmitting}
        >
          Annuler
        </button>
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? '⏳ Enregistrement...' : (isEdit ? '💾 Enregistrer' : '➕ Créer')}
        </button>
      </div>

      <style jsx>{`
        .local-form {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .form-header h3 {
          margin: 0 0 1.5rem 0;
          color: #1a1a1a;
          font-size: 1.25rem;
        }

        .alert {
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }

        .alert-error {
          background: #fee;
          color: #c00;
          border: 1px solid #fcc;
        }

        .form-group {
          margin-bottom: 1.25rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          color: #333;
          font-weight: 500;
          font-size: 0.95rem;
        }

        input, select, textarea {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s;
          font-family: inherit;
        }

        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: #4CAF50;
        }

        input.error, select.error, textarea.error {
          border-color: #f44336;
        }

        .error-message {
          display: block;
          color: #f44336;
          font-size: 0.85rem;
          margin-top: 0.5rem;
        }

        textarea {
          resize: vertical;
          min-height: 80px;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid #e0e0e0;
        }

        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          min-width: 120px;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background: #4CAF50;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #45a049;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
        }

        .btn-secondary {
          background: #f5f5f5;
          color: #666;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #e0e0e0;
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          .local-form {
            padding: 1rem;
          }

          .form-header h3 {
            font-size: 1.1rem;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          input, select, textarea {
            padding: 14px 16px;
            font-size: 16px; /* Évite le zoom automatique sur iOS */
          }

          .btn {
            padding: 14px 20px;
            font-size: 1rem;
          }

          .form-actions {
            flex-direction: column-reverse;
          }

          .form-actions .btn {
            width: 100%;
          }
        }

        /* Amélioration tactile pour mobile */
        @media (hover: none) and (pointer: coarse) {
          .btn {
            min-height: 48px; /* Taille recommandée pour le tactile */
          }
        }
      `}</style>
    </form>
  );
}

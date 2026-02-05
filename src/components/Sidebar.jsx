import React from 'react';

const Sidebar = ({ selectedComponent, onDelete }) => {
    if (!selectedComponent) {
        return (
            <div className="pcb-sidebar">
                <div className="sidebar-section">
                    <h3>Component Details</h3>
                    <p>Select a pad or trace to view details.</p>
                </div>
            </div>
        );
    }

    const { id, type, pos, size, area } = selectedComponent;

    return (
        <div className="pcb-sidebar">
            <div className="sidebar-section">
                <h3>Component Details</h3>
                <div className="detail-item">
                    <label>ID:</label>
                    <span>{id}</span>
                </div>
                <div className="detail-item">
                    <label>Type:</label>
                    <span>{type}</span>
                </div>
            </div>

            <div className="sidebar-section">
                <h3>Transform</h3>
                <div className="detail-item">
                    <label>X:</label>
                    <span>{pos[0].toFixed(2)}</span>
                </div>
                <div className="detail-item">
                    <label>Z:</label>
                    <span>{pos[2].toFixed(2)}</span>
                </div>
            </div>

            <div className="sidebar-section">
                <h3>Geometry</h3>
                <div className="detail-item">
                    <label>Width:</label>
                    <span>{size[0].toFixed(2)}</span>
                </div>
                <div className="detail-item">
                    <label>Height:</label>
                    <span>{size[1].toFixed(2)}</span>
                </div>
                <div className="detail-item">
                    <label>Surface Area:</label>
                    <span>{area.toFixed(2)} units²</span>
                </div>
            </div>

            <div className="sidebar-section delete-section">
                <button className="delete-button" onClick={() => onDelete(id)}>
                    Delete Component
                </button>
            </div>
        </div>
    );
};

export default Sidebar;

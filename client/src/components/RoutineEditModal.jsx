import React, { useState } from "react";
import { X, Plus, Trash2, Save } from "lucide-react";

export default function RoutineEditModal({ routine, onClose, onSave }) {
    const [editedDays, setEditedDays] = useState([...routine.days]);
    const [semester, setSemester] = useState(routine.semester);

    const handleAddSlot = (dayIndex) => {
        const newDays = [...editedDays];
        newDays[dayIndex].slots.push({
            startTime: "10:00 AM",
            endTime: "11:00 AM",
            subject: "",
            subjectCode: "",
            teacher: "",
            room: "",
            color: "blue"
        });
        setEditedDays(newDays);
    };

    const handleRemoveSlot = (dayIndex, slotIndex) => {
        const newDays = [...editedDays];
        newDays[dayIndex].slots.splice(slotIndex, 1);
        setEditedDays(newDays);
    };

    const handleUpdateSlot = (dayIndex, slotIndex, field, value) => {
        const newDays = [...editedDays];
        newDays[dayIndex].slots[slotIndex][field] = value;
        setEditedDays(newDays);
    };

    const colors = ["blue", "orange", "purple", "green", "red"];

    return (
        <div className="routine-modal-overlay">
            <div className="routine-modal">
                <div className="routine-modal-header">
                    <h2>Edit Class Routine</h2>
                    <button onClick={onClose} className="close-btn"><X size={20} /></button>
                </div>

                <div className="routine-modal-content">
                    <div className="semester-edit">
                        <label>Academic Semester</label>
                        <input
                            type="text"
                            placeholder="e.g. Spring 2026"
                            value={semester}
                            onChange={(e) => setSemester(e.target.value)}
                        />
                    </div>

                    <div className="days-edit-list">
                        {editedDays.map((day, dIdx) => (
                            <div key={day.name} className="day-edit-section">
                                <div className="day-header">
                                    <h3>{day.name}</h3>
                                    <button onClick={() => handleAddSlot(dIdx)} className="add-slot-btn">
                                        <Plus size={16} /> Add Class Slot
                                    </button>
                                </div>
                                <div className="slots-grid">
                                    {day.slots.length === 0 && (
                                        <p className="no-slots">No classes scheduled for this day.</p>
                                    )}
                                    {day.slots.map((slot, sIdx) => (
                                        <div key={sIdx} className="slot-edit-card">
                                            <div className="slot-input-group">
                                                <div className="input-row">
                                                    <div className="field-group">
                                                        <label>Start</label>
                                                        <input
                                                            type="text"
                                                            value={slot.startTime}
                                                            onChange={(e) => handleUpdateSlot(dIdx, sIdx, "startTime", e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="field-group">
                                                        <label>End</label>
                                                        <input
                                                            type="text"
                                                            value={slot.endTime}
                                                            onChange={(e) => handleUpdateSlot(dIdx, sIdx, "endTime", e.target.value)}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="field-group">
                                                    <label>Subject Name</label>
                                                    <input
                                                        type="text"
                                                        value={slot.subject}
                                                        onChange={(e) => handleUpdateSlot(dIdx, sIdx, "subject", e.target.value)}
                                                    />
                                                </div>

                                                <div className="input-row">
                                                    <div className="field-group">
                                                        <label>Code</label>
                                                        <input
                                                            type="text"
                                                            value={slot.subjectCode}
                                                            onChange={(e) => handleUpdateSlot(dIdx, sIdx, "subjectCode", e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="field-group">
                                                        <label>Room</label>
                                                        <input
                                                            type="text"
                                                            value={slot.room}
                                                            onChange={(e) => handleUpdateSlot(dIdx, sIdx, "room", e.target.value)}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="field-group">
                                                    <label>Teacher</label>
                                                    <input
                                                        type="text"
                                                        value={slot.teacher}
                                                        onChange={(e) => handleUpdateSlot(dIdx, sIdx, "teacher", e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="slot-footer">
                                                <button onClick={() => handleRemoveSlot(dIdx, sIdx)} className="remove-slot-btn" title="Remove Slot">
                                                    Delete Sub
                                                </button>
                                                <div className="color-selector">
                                                    {colors.map(c => (
                                                        <button
                                                            key={c}
                                                            className={`color-dot ${c} ${slot.color === c ? 'active' : ''}`}
                                                            onClick={() => handleUpdateSlot(dIdx, sIdx, "color", c)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="routine-modal-footer">
                    <button onClick={onClose} className="cancel-btn">Discard Changes</button>
                    <button onClick={() => onSave({ semester, days: editedDays })} className="save-btn-primary">
                        <Save size={18} /> Save Routine
                    </button>
                </div>
            </div>
        </div>
    );
}

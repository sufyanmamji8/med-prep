// src/components/dashboard/sections/RevisionPage.jsx
import React, { useEffect, useState } from "react";
import { db } from "../../../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";

const RevisionPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    const fetchSubjects = async () => {
      const querySnapshot = await getDocs(collection(db, "subjects"));
      const subs = [];
      querySnapshot.forEach((doc) => {
        subs.push({ id: doc.id, ...doc.data() });
      });
      setSubjects(subs);
    };
    fetchSubjects();
  }, []);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const startPractice = () => {
    if (selected.length === 0) {
      alert("Please select at least one subject!");
      return;
    }
    // navigate to MCQ practice with selected subjects
    console.log("Starting revision with:", selected);
    // navigate(`/revision-practice`, { state: { subjects: selected } });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Choose Subjects for Revision</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {subjects.map((subject) => (
          <div
            key={subject.id}
            onClick={() => toggleSelect(subject.id)}
            className={`p-4 rounded-lg border cursor-pointer ${
              selected.includes(subject.id)
                ? "bg-green-100 border-green-500"
                : "bg-white border-gray-300"
            }`}
          >
            <h2 className="font-semibold">{subject.name}</h2>
            {subject.subSubjects && (
              <ul className="mt-2 text-sm text-gray-600">
                {subject.subSubjects.map((sub, idx) => (
                  <li key={idx}>- {sub}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={startPractice}
        className="mt-6 w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
      >
        Start Revision
      </button>
    </div>
  );
};

export default RevisionPage;

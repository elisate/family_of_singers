import React from "react";
import "../styles/familyGrid.css"; // Import CSS for styling

// Family data (simulating database entries)
const familyData = [
  {
    id: 1,
    name: "Mama Dorothee Family",
    description: "Description",
    image: "/src/assets/menFrame.jpg", // Replace with actual image paths
  },
  {
    id: 2,
    name: "Mama Dorothee Family",
    description: "Description",
    image: "src/assets/ladiesInPink.jpg",
  },
  {
    id: 3,
    name: "Mama Dorothee Family",
    description: "Description",
    image: "/src/assets/OneMan.jpg",
  },
  {
    id: 4,
    name: "Mama Dorothee Family",
    description: "Description",
    image: "src/assets/ladiesInPink.jpg",
  },
  {
    id: 5,
    name: "Mama Dorothee Family",
    description: "Description",
    image: "/src/assets/leadingMan.jpg",
  },
  {
    id: 6,
    name: "Mama Dorothee Family",
    description: "Description",
    image: "/src/assets/SeatedInPink.jpg",
  },
];

const FamilyGrid = () => {
  return (
    <section className="family-section">
      <h2 className="section-title">
        <span>Our Families</span>
      </h2>
      <div className="family-grid">
        {familyData.map((family) => (
          <div className="family-card" key={family.id}>
            <div className="family-image">
              <img src={family.image} alt={family.name} />
            </div>
            <h3 className="family-name">{family.name}</h3>
            <p className="family-description">{family.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FamilyGrid;

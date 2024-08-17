import React, { useState, useEffect } from "react";
import "./Dashboard.css";

const Dashboard = () => {
  const [isOverlayVisible, setOverlayVisible] = useState(false);
  const [isAddCategoryOverlayVisible, setAddCategoryOverlayVisible] =
    useState(false);
  const [categories, setCategories] = useState([]);
  const [newButton, setNewButton] = useState({
    text: "",
    image: "",
    category: "",
  });
  const [newCategory, setNewCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("http://localhost:3001/categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const showOverlay = () => setOverlayVisible(true);
  const hideOverlay = () => setOverlayVisible(false);
  const showAddCategoryOverlay = () => setAddCategoryOverlayVisible(true);
  const hideAddCategoryOverlay = () => setAddCategoryOverlayVisible(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewButton({ ...newButton, [name]: value });
  };

  const handleAddButton = async () => {
    if (!newButton.category) {
      alert("Please select a category before adding a button.");
      return;
    }

    try {
      const categoryIndex = categories.findIndex(
        (cat) => cat.name === newButton.category
      );
      if (categoryIndex === -1) {
        const newCategory = {
          name: newButton.category,
          buttons: [{ text: newButton.text, image: newButton.image }],
        };
        const response = await fetch("http://localhost:3001/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newCategory),
        });
        if (response.ok) {
          fetchData();
        }
      } else {
        const updatedCategory = {
          ...categories[categoryIndex],
          buttons: [
            ...categories[categoryIndex].buttons,
            { text: newButton.text, image: newButton.image },
          ],
        };
        const response = await fetch(
          `http://localhost:3001/categories/${categories[categoryIndex].id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedCategory),
          }
        );
        if (response.ok) {
          fetchData();
        }
      }
      setNewButton({ text: "", image: "", category: "" });
      hideOverlay();
    } catch (error) {
      console.error("Error adding button:", error);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      alert("Please enter a category name.");
      return;
    }
    try {
      const response = await fetch("http://localhost:3001/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategory, buttons: [] }),
      });
      if (response.ok) {
        fetchData();
        setNewCategory("");
        hideAddCategoryOverlay();
      }
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const handleRemoveButton = async (categoryId, buttonIndex) => {
    try {
      const category = categories.find((cat) => cat.id === categoryId);
      const updatedButtons = category.buttons.filter(
        (_, index) => index !== buttonIndex
      );
      const response = await fetch(
        `http://localhost:3001/categories/${categoryId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...category, buttons: updatedButtons }),
        }
      );
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Error removing button:", error);
    }
  };

  const filteredCategories = categories
    .map((category) => ({
      ...category,
      buttons: category.buttons.filter((button) =>
        button.text.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((category) => category.buttons.length > 0);

  return (
    <div className="dashboard">
      <div className="dashboard-controls">
        <button onClick={showOverlay} className="add-button">
          Add Widget
        </button>
        <button onClick={showAddCategoryOverlay} className="add-button">
          Add Category
        </button>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-select"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search widgets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="categories-list">
        {filteredCategories
          .filter(
            (category) =>
              !selectedCategory || category.name === selectedCategory
          )
          .map((category) => (
            <div key={category.id} className="category">
              <h2>{category.name}</h2>
              <div className="button-grid">
                {category.buttons.map((button, index) => (
                  <div key={index} className="custom-button">
                    {button.image && (
                      <img src={button.image} alt={button.text} />
                    )}
                    <p>{button.text}</p>
                    <button
                      className="remove-button"
                      onClick={() => handleRemoveButton(category.id, index)}
                    >
                      &#x2715;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>

      {isOverlayVisible && (
        <div className="overlay">
          <div className="overlay-content">
            <h2>Add New Widget</h2>
            <button className="close-overlay" onClick={hideOverlay}>
              &#x2715;
            </button>
            <input
              type="text"
              name="text"
              value={newButton.text}
              onChange={handleInputChange}
              placeholder="Widget Text"
            />
            <input
              type="text"
              name="image"
              value={newButton.image}
              onChange={handleInputChange}
              placeholder="Image URL (optional)"
            />
            <select
              name="category"
              value={newButton.category}
              onChange={handleInputChange}
              className="category-select"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
            <button className="add-button-overlay" onClick={handleAddButton}>
              Add Widget
            </button>
          </div>
        </div>
      )}

      {isAddCategoryOverlayVisible && (
        <div className="overlay">
          <div className="overlay-content">
            <h2>Add New Category</h2>
            <button className="close-overlay" onClick={hideAddCategoryOverlay}>
              &#x2715;
            </button>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Category Name"
            />
            <button className="add-button" onClick={handleAddCategory}>
              Add Category
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

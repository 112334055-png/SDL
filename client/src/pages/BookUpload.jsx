import { useState } from "react";

function BookUpload() {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "",
    availableCopies: 1
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      alert(data.message);

      setFormData({
        title: "",
        author: "",
        isbn: "",
        category: "",
        availableCopies: 1
      });

    } catch (error) {
      console.error(error);
      alert("Error adding book");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>📚 Upload New Book</h2>

      <form onSubmit={handleSubmit} style={{ maxWidth: "400px" }}>
        <input
          type="text"
          name="title"
          placeholder="Book Title"
          value={formData.title}
          onChange={handleChange}
          required
        /><br /><br />

        <input
          type="text"
          name="author"
          placeholder="Author"
          value={formData.author}
          onChange={handleChange}
          required
        /><br /><br />

        <input
          type="text"
          name="isbn"
          placeholder="ISBN"
          value={formData.isbn}
          onChange={handleChange}
        /><br /><br />

        <input
          type="text"
          name="category"
          placeholder="Category"
          value={formData.category}
          onChange={handleChange}
        /><br /><br />

        <input
          type="number"
          name="availableCopies"
          placeholder="Available Copies"
          value={formData.availableCopies}
          onChange={handleChange}
        /><br /><br />

        <button type="submit">Add Book</button>
      </form>
    </div>
  );
}

export default BookUpload;

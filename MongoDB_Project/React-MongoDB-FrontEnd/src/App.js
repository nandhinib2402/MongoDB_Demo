// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;
import {useEffect,useState} from "react";
import axios from "axios";
function App() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [allImage, setAllImage] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  
  useEffect(() => {
    getPdf();
  }, []);

  const getPdf = async () => {
    const result = await axios.get("http://localhost:5000/get-files");
    console.log(result.data.data);
    setAllImage(result.data.data);
  };

  const submitImage = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);
    console.log(title, file);
  
    const result = await axios.post(
      "http://localhost:5000/upload-files",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    console.log(result);
    if (result.data.status == "ok") {
      alert("Uploaded Successfully!!!");
      getPdf();
    }
  }
  const showPdf = (pdf) => {
     window.open(`http://localhost:5000/files/${pdf}`, "_blank", "noreferrer");
    //setPdfFile(`http://localhost:5000/files/${pdf}`)
  };
  const handleDownload = async (id, title) => {
    try {
      const response = await axios.get(`http://localhost:5000/download-pdf/${id}`, {
        responseType: 'blob' // Set response type to 'blob' for downloading files
      });
      
      // Create a temporary URL for the downloaded file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Create a link element and simulate a click to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title}.pdf`);
      document.body.appendChild(link);
      link.click();
      // Cleanup
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/search?q=${searchQuery}`
      );
      setSearchResults(response.data.results);
    } catch (error) {
      console.error("Error performing text search:", error);
    }
  };
    return (
      <div className="App">
        <form className="formStyle" onSubmit={submitImage} >
          <h4>Upload Pdf</h4>
          <br />
          <input
            type="text"
            className="form-control"
            placeholder="Title"
            required
            onChange={(e) => setTitle(e.target.value)}
          />
          <br />
          <input
            type="file"
            class="form-control"
            accept="application/pdf"
            
            required
            onChange={(e) => setFile(e.target.files[0])}
          />
          <br />
          <button class="btn btn-primary" type="submit">
            Submit
          </button>
        </form>
        <h5 class="m-3">Search and Download Documents</h5>
        <div className="search-container">
         
        <input
          type="text"
          class="form-control"
          placeholder="Search PDF"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleSearch}>Search</button>
        
      </div>
      
         <div className="uploaded">
          <h4>Uploaded PDF:</h4>
          <div className="output-div">
            {allImage == null
              ? "hi"
              : searchResults.map((data) => {
                console.log("hih",data);
                  return (
                    <div className="inner-div">
                      <h6 onClick={() => handleDownload(data._id,data.title)}> {data.title}</h6>
                      {/* <button
                        className="btn btn-primary"
                        onClick={() => showPdf(data.pdf)}
                      >
                        Show Pdf
                      </button> */}
                    </div>
                  );
              //   <li key={data._id}>
              //   <button onClick={() => handleDownload(data._id,data.title)}>
              //     {data.title}
              //   </button>
              // </li>
                 })
              }
          </div>
        </div>
        {/* //<PdfComp pdfFile={pdfFile}/>  */}
      </div>
    
  );
  
}

export default App;

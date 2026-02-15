import api from "../api/axios";

useEffect(() => {
  api.get("/dashboard/")
    .then(res => console.log(res.data))
    .catch(err => console.log(err));
}, []);

import axios from 'axios'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CURRENT_BASE_URL } from '../../utility/apiConfig'
import Navbar from '../../components/common/navbar/Navbar'
import { downloadPdfDocument } from '../../utility/util'

interface ModelData {
  id: number,
  image_path: string,
  minQty: number,
  modName: string,
  name: string,
  price: number,
  safetyRating: number,
  createdAt: string,
  updatedAt: string
}

interface UserData {
  company_name: string | null;
  telephone: string;
  gst_number: string;
  username: string;
}

const Invoice = () => {

  const { modelId } = useParams()
  const [userData, setUserData] = useState<UserData>();
  const [selectedData, setSelectedData] = useState<any[]>([]);
  const [totalCompAmt, setTotalCompAmt] = useState<number>();
  const [modelData, setModelData] = useState<ModelData>()
  const [quantity, setQuantity] = useState<number>();
  const [error, setError] = useState<string | null>(null);
  const [minQuantity, setMinQuantity] = useState<number>(1);


  useEffect(() => {
    const dataFromStorage = sessionStorage.getItem('selectedComp');
    if (dataFromStorage !== null) {
      setSelectedData(JSON.parse(dataFromStorage));
    }

    try {
      (async () => {
        let res = await axios.get(`/models/${modelId}`)
        let userInfo = await axios.get(`/auth/user/${localStorage.getItem('userId')}`)
        console.log(userInfo)
        setUserData(userInfo.data.data[0])
        setModelData(res.data.data.models)
        setMinQuantity(res.data.data.models.minQty)
        // console.log(res.data.data.models)
      })()
    } catch (e) {
      console.log(e)
    }
  }, [])

  useEffect(() => {
    const totalPrice = selectedData.reduce((acc, item) => {
      return acc + parseInt(item.selectedValue.split('@')[3], 10);
    }, 0);
    // console.log('tp', parseInt(totalPrice, 10))
    setTotalCompAmt(totalPrice)
  }, [selectedData])

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = parseInt(value, 10);

    if (isNaN(numericValue)) {
      setError('Quantity must be a number');
    } else if (numericValue < minQuantity) {
      setError(`Quantity must be at least ${minQuantity}`);
    } else {
      setError(null);
      setQuantity(numericValue);
    }
  };

  const handlePay = () => {
    downloadPdfDocument()
    // console.log('pay');
    // console.log("userId", 1);
    // console.log(modelId);
    // console.log(quantity || minQuantity);
    // console.log(selectedData);
    if (!selectedData.length) {
      const userId = localStorage.getItem('userId')
      const requestData = {
        userId: userId,
        modelId: modelId,
        orderedQty: quantity || minQuantity
      }

      axios.post('/invoice', requestData)
        .then((res) => {
          console.log('API response:', res);
          if (res.data.status == 200) {
            console.log(res); alert("Ordered successfully!")
          }
        })
        .catch((e) => {
          console.error('API error:', e);
        })

    }

    selectedData.forEach((item) => {
      // console.log(item.comp_id);
      const userId = localStorage.getItem('userId')
      const requestData = {
        userId: userId,
        modelId: modelId,
        orderedQty: quantity || minQuantity,
        altCompId: item.comp_id,
      };

      axios.post('/invoice', requestData)
        .then((res) => {
          console.log('API response:', res);
          if (res.data.status == 200) { console.log(res); alert("Ordered successfully!") }
        })
        .catch((e) => {
          console.error('API error:', e);
        });
    });
  };

  return (<>
    <Navbar />
    {/* {sessionStorage.getItem('selectedComp')} */}
    <div className="details-wrapper" id='invoiceId'>
      <div className="details-info">
        <div className='details-info-body'>
          <p>Date: <span>{new Date().toLocaleDateString()}</span></p>
          <p>Time: <span>{new Date().toLocaleTimeString()}</span></p>
          <p>Vehicle Configurator App</p><br/>

          <h3>Configured Features Added</h3>
          ---------------------------------------------------------------------------
          {selectedData.map((item, index) => (
            <p key={index}>
              {item.selectedValue.split('@')[2]}<br />
              {item.selectedValue ? "₹" : null}
              {item.selectedValue.split('@')[3]}
            </p>
          ))}

        </div>
        <br />
        <div>
          <h3>Total</h3>
          <pre>
            ---------------------------------------------------------------------------
            <p>Component Total: {totalCompAmt}</p>
            <p>
              Car Price:       {modelData?.price} * {quantity || minQuantity}
            </p>
            <p>
              Car Quantity:    {quantity || minQuantity}
            </p>
            <p>
              Total Car Price: {(modelData?.price || minQuantity) * (quantity || minQuantity)}
            </p>
          </pre>
        </div>
        <br />
        <div>
          <h3>Customer Info</h3>
          <pre>
            ---------------------------------------------------------------------------
            <p>Name:      {userData?.username}</p>
            <p>Company:   {userData?.company_name}</p>
            <p>Telephone: {userData?.telephone}</p>
            <p>GST NO:    {userData?.gst_number}</p>
          </pre>
        </div>

      </div>
      <div id='rid'>
        <div className="image-wrapper" >
          <div className='image-wrapper-child'>
            <h1>{modelData?.modName}</h1>
            <img
              className="details-car-img"
              src={`${CURRENT_BASE_URL}/${modelData?.image_path}`}
              alt="image"
            />
          </div>

          <div id='rid'>
            <p>Price: {modelData?.price}</p><br />
            <p>safetyRating: {modelData?.safetyRating}</p><br />
            <label htmlFor="quantity">Quantity:</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={quantity || minQuantity}
              onChange={handleQuantityChange}
              className='g-input'
            />
            {error && <div style={{ color: 'red' }}>{error}</div>}
          </div>
        </div>

        <div className="btn-panel">
          <button className='button' onClick={handlePay}>Pay</button>
        </div>
      </div >
    </div>
  </>
  )
}

export default Invoice
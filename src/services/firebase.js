import app from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";
import firebaseConfig from "./config";
import axios, {isCancel, AxiosError} from 'axios';


class Firebase {
  constructor() {
    // app.initializeApp(firebaseConfig);

    // this.storage = app.storage();
    // this.db = app.firestore();
    // this.auth = app.auth();
  }

  // // PRODUCT ACTIONS --------------

  getSingleProduct = (id) => this.db.collection("products").doc(id).get();

  getProducts = (lastRefKey) => {
    let didTimeout = false;

    return new Promise((resolve, reject) => {
      (async () => {
            console.log("Getting products" )
          try {
              axios.get('http://0.0.0.0:8080/api/products')
              .then(function (response) {
                // handle success
                resolve(response);
              })
              .catch(function (error) {
                // handle error
                console.log(error);
              })
              .finally(function () {
                // always executed
              });
          } catch (e) {
            reject(e?.message || ":( Failed to fetch products.");
          }
      })();
    });
  };

  searchProducts = (searchKey) => {
      console.log("searchKey", searchKey)
    let didTimeout = false;

    return new Promise((resolve, reject) => {
      (async () => {
        const timeout = setTimeout(() => {
          didTimeout = true;
          reject(new Error("Request timeout, please try again"));
        }, 15000);

        try {
          clearTimeout(timeout);
          if (!didTimeout) {
              console.log("Filter", searchKey)
              axios.get('http://0.0.0.0:8080/api/products')
              .then(function (response) {
                // handle success
                resolve(response);
                const hash = {};

                mergedProducts.forEach((product) => {
                  hash[product.id] = product;
                });

                resolve({ products: Object.values(hash)  });
              })
              .catch(function (error) {
                // handle error
                console.log(error);
              })
              .finally(function () {
                // always executed
              });

          }
        } catch (e) {
          if (didTimeout) return;
          reject(e);
        }
      })();
    });
  };

  getFeaturedProducts = (itemsCount = 12) =>
    this.db
      .collection("products")
      .where("isFeatured", "==", true)
      .limit(itemsCount)
      .get();

  getRecommendedProducts = (itemsCount = 12) =>
    this.db
      .collection("products")
      .where("isRecommended", "==", true)
      .limit(itemsCount)
      .get();

  addProduct = (id, product) =>
    this.db.collection("products").doc(id).set(product);

  generateKey = () => this.db.collection("products").doc().id;

  storeImage = async (id, folder, imageFile) => {
    const snapshot = await this.storage.ref(folder).child(id).put(imageFile);
    const downloadURL = await snapshot.ref.getDownloadURL();

    return downloadURL;
  };

  deleteImage = (id) => this.storage.ref("products").child(id).delete();

  editProduct = (id, updates) =>
    this.db.collection("products").doc(id).update(updates);

  removeProduct = (id) => this.db.collection("products").doc(id).delete();
}

const firebaseInstance = new Firebase();

export default firebaseInstance;

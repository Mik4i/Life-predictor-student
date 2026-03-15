PRD Backend
AI Life Predictor
1. Overview
AI Life Predictor merupakan sistem berbasis machine learning yang bertujuan untuk menganalisis pola kebiasaan harian pengguna dan memprediksi kondisi kesejahteraan mental serta produktivitas. Backend bertanggung jawab dalam pengolahan data pengguna, integrasi model machine learning, penyimpanan data, serta penyediaan API yang akan dikonsumsi oleh frontend dashboard.

Sistem backend akan dibangun menggunakan FastAPI, yang dipilih karena performa tinggi, dukungan asynchronous processing, serta integrasi yang baik dengan ekosistem machine learning Python seperti scikit-learn.

Backend juga akan menggunakan PostgreSQL sebagai sistem manajemen basis data utama untuk menyimpan data pengguna, data kebiasaan harian, serta histori prediksi.

2. Tujuan Sistem
Backend harus mampu:
- menerima input data lifestyle user
- melakukan preprocessing data
- menjalankan model machine learning
- mengembalikan hasil prediksi secara cepat
- menyimpan data untuk histori analisis
- menyediakan API untuk frontend dashboard
Target response time:
- API Response Time	< 500 ms
- Prediction Processing Time	< 200 ms
- System Availability	99% uptime
- Error Rate	< 1%

3. Teknologi yang Digunakan
a. Framework Backend
- FastAPI
b. Alasan:
- performa sangat cepat
- async support
- otomatis generate API docs
- mudah deploy

c. Machine Learning
- scikit-learn
- Random Forest
- Logistic Regression
- XGBoost (opsional)

d. Database
- PostgreSQL
Digunakan untuk:
- menyimpan data user
- menyimpan histori prediksi
- menyimpan data kebiasaan

e. ORM
- SQLAlchemy

4. Arsitektur Backend
Flow sistem:
- Frontend → API Request → FastAPI → ML Model → Database → Response ke Frontend
Langkah:
- User mengisi form lifestyle
- Frontend mengirim request API
- Backend melakukan preprocessing
- Model ML melakukan prediksi
- Backend menyimpan data ke database
- Backend mengirim hasil prediksi

5. Struktur Folder Backend
ai-life-predictor-backend

APPS
backend
 ├── main.py
 ├── routes
 │   └── predict.py
 ├── models
 │   └── ml_model.pkl
 ├── services
 │   └── prediction_service.py
 ├── database
 │   ├── db.py
 │   └── models.py
 ├── schemas
 │   └── request_schema.py
 └── utils
     └── preprocessing.py

7. Pipeline Machine Learning

Ketika API dipanggil:
- menerima data user
- preprocessing data
- encoding kategori
- scaling jika diperlukan
- menjalankan model
- menghasilkan prediksi
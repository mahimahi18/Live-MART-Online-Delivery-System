import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { getProductsNearMe } from './services/productService';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = {
  lat: 17.3850,
  lng: 78.4867
};

export default function ShopsNearMe() {
  const [radius, setRadius] = useState(5);
  const [products, setProducts] = useState([]);
  const [center, setCenter] = useState(defaultCenter);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      });
    }
  }, []);

  useEffect(() => {
    const fetchNearby = async () => {
      const nearbyProducts = await getProductsNearMe([center.lat, center.lng], radius);
      setProducts(nearbyProducts);
    };

    fetchNearby();
  }, [radius, center]);

  return (
    <Container className="my-5">
      <h2>Shops Near Me</h2>

      <Form.Group className="mb-4">
        <Form.Label>Search Radius: {radius} km</Form.Label>
        <Form.Range
          min={1}
          max={50}
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
        />
      </Form.Group>

      <LoadScript googleMapsApiKey="AIzaSyAkXrnCfqCoIRY2NgBBZeodEssBmxBlWTo">
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={11}>
          <Marker position={center} label="Me" />

          {products.map((product) => (
            product.lat && product.lng && (
              <Marker
                key={product.id}
                position={{ lat: product.lat, lng: product.lng }}
                title={product.name}
              />
            )
          ))}
        </GoogleMap>
      </LoadScript>

      <Row className="mt-4 g-4">
        {products.map((product) => (
          <Col md={4} key={product.id}>
            <Card>
              <Card.Body>
                <Card.Title>{product.name}</Card.Title>
                <Card.Text>Price: ${product.price}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

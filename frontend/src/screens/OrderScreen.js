/* eslint-disable array-callback-return */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useReducer } from 'react';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Store } from '../Store';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { getError } from '../utils';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import Card from 'react-bootstrap/Card';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCESS':
      return { ...state, loading: false, ordere: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}
export default function OrderScreen() {
  const fetchOrder = async () => {
    try {
      dispatch({ type: 'FETCH_REQUEST' });
      const { data } = await axios.get(`/api/orders/${orderId}`, {
        headers: { authorization: `Bearer ${userInfo.token}` },
      });
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (err) {
      dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
    }
  };
  const { state } = useContext(Store);
  const { userInfo } = state;
  const navigate = useNavigate();
  const params = useParams;
  const { id: orderId } = params;
  const [{ loading, error, order }, dispatch] = useReducer(reducer, {
    loading: true,
    order: {},
    error: '',
  });

  useEffect(() => {
    if (!userInfo) {
      return navigate('/login');
    }
    if (!order._id || (order._id && order._id !== orderId)) {
      fetchOrder();
    }
  }, [order, userInfo, orderId, navigate]);
  return loading ? (
    <LoadingBox></LoadingBox>
  ) : error ? (
    <MessageBox variant="danger"></MessageBox>
  ) : (
    <div>
      <Helmet>
        <title>Order {orderId}</title>
      </Helmet>
      <h1 className="my-3">Order {orderId}</h1>
      <Row>
        <Col>
          <Card.Body>
            <Card.Title>Shipping</Card.Title>
            <Card.Text>
              <strong>Name:</strong> {order.shippingAddress.fullName}
              <br />
              <strong>Address:</strong> {order.shippingAddress.address},
              {order.shippingAddress.city},{order.shippingAddress.postalCode}, ,
              {order.shippingAddress.country}
            </Card.Text>
            {order.isDelivered ? (
              <MessageBox variant="success">
                Delivered at {order.deliveredAt}
              </MessageBox>
            ) : (
              <MessageBox variant="danger">Not Delivered</MessageBox>
            )}
          </Card.Body>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Items</Card.Title>
              <ListGroup variant="flush">
                {order.orderItems.map((item) => {
                  <ListGroup.Item key={item._id}>
                    <Row className="align-items-center">
                      <Col md={6}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="img-fluid rounded img-thumbnail"
                        ></img>
                        {''}
                        <Link to={`/product/${item.slug}`}>{item.name}</Link>
                      </Col>
                      <Col md={3}>
                        <span>{item.quantity}</span>
                      </Col>
                      <Col md={3}>${item.price}</Col>
                    </Row>
                  </ListGroup.Item>;
                })}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}></Col>
        <Card className="mb-3">
          <Card.Body>
            <Card.Title>Order Summary</Card.Title>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <Row>
                  <Col>Items</Col>
                  <Col>${order.itrmsPrice.toFixed(2)}</Col>
                </Row>
              </ListGroup.Item>

              <ListGroup.Item>
                <Row>
                  <Col>Shipping</Col>
                  <Col>${order.shippingPrice.toFixed(2)}</Col>
                </Row>
              </ListGroup.Item>

              <ListGroup.Item>
                <Row>
                  <Col>Tax</Col>
                  <Col>${order.taxPrice.toFixed(2)}</Col>
                </Row>
              </ListGroup.Item>

              <ListGroup.Item>
                <Row>
                  <Col>Order Total</Col>
                  <Col>${order.totalPrice.toFixed(2)}</Col>
                </Row>
              </ListGroup.Item>
            </ListGroup>
          </Card.Body>
        </Card>
      </Row>
    </div>
  );
}

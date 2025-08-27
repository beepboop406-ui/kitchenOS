import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./App.css";

function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [timers, setTimers] = useState({});


  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/orders/")
      .then((response) => {
        setOrders(response.data);
      })
      .catch((error) => {
        console.error("There was an error fetching the orders!", error);
      });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => {
        const updated = {};
        Object.keys(prev).forEach(key => {
          updated[key] = Math.max(0, prev[key] - 1);
        });
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const initialTimers = {};
    orders.forEach((order) => {
      if (normalizeStatus(order.status) === "COOKING") {
        order.items.forEach((i) => {
          const itemKey = `${order.id}-${i.id}`;
          initialTimers[itemKey] = i.cook_time * 60;
        });
        initialTimers[`order-${order.id}`] = Math.max(...order.items.map(i => i.cook_time * 60));
      }
    });
    setTimers(initialTimers);
  }, [orders]);


  useEffect(() => {
    const interval = setInterval(() => {
      orders.forEach((order) => {
        if (normalizeStatus(order.status) === "NEW_ORDER") {
          const placed = new Date(order.created_at).getTime();
          const diff = (Date.now() - placed) / 1000;
          if (diff > 300) {
            alert(`Order ID 00${order.id} has been in NEW ORDER for more than 5 minutes!`);
          }
        }
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [orders]);


  const normalizeStatus = (status) => {
    const mapping = {
      "New Order": "NEW_ORDER",
      Cooking: "COOKING",
      Ready: "READY",
      Dispatched: "DISPATCHED",
      NEW_ORDER: "NEW_ORDER",
      COOKING: "COOKING",
      READY: "READY",
      DISPATCHED: "DISPATCHED",
    };
    return mapping[status] || status;
  };

  const updateStatus = (orderId, newStatus) => {
    axios
      .patch(`http://127.0.0.1:8000/orders/${orderId}/`, {
        status: newStatus,
        cooking_started_at: newStatus === "COOKING" ? new Date().toISOString() : null
      })
      .then((response) => {
        const updatedOrderFromBackend = response.data;
        setOrders(prevOrders =>
          prevOrders.map(order => {
            if (order.id === orderId) {
              const updatedOrder = { ...order, ...updatedOrderFromBackend };

              if (newStatus === "COOKING") {
                setTimers(prev => {
                  const newTimers = { ...prev };
                  updatedOrder.items.forEach(i => {
                    const itemKey = `${updatedOrder.id}-${i.id}`;
                    newTimers[itemKey] = i.cook_time * 60;
                  });
                  newTimers[`order-${updatedOrder.id}`] = Math.max(...updatedOrder.items.map(i => i.cook_time * 60));
                  return newTimers;
                });
              }

              return updatedOrder;
            }
            return order;
          })
        );
      })
      .catch(error => console.error(error));
  };

  const groupedOrders = {
    NEW_ORDER: [],
    COOKING: [],
    READY: [],
    DISPATCHED: [],
  };

  orders.forEach((order) => {
    const normalized = normalizeStatus(order.status);
    if (groupedOrders[normalized]) {
      groupedOrders[normalized].push(order);
    } else {
      console.warn("Unknown status:", order.status, order);
    }
  });

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  const calculateRemainingTime = (startTime, durationMinutes) => {
    if (!startTime) return durationMinutes * 60;
    const endTime = new Date(startTime).getTime() + durationMinutes * 60 * 1000;
    const now = Date.now();
    return Math.max(0, Math.floor((endTime - now) / 1000));
  };

  const formatSeconds = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const resetOrders = () => {
    axios
      .post("http://127.0.0.1:8000/reset/")
      .then(() => {
        return axios.get("http://127.0.0.1:8000/orders/");
      })
      .then((response) => {
        setOrders(response.data);
      })
      .catch((error) => {
        console.error("Error resetting orders:", error);
      });
  };



  return (
    <>
      <div className="dashboard-cont">
        <div className="dashboard-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h1>ANDO</h1>
          <h3>Kitchen Operating System</h3>

          {/* Dispatched Summary */}
          <div className="dispatched-summary">
            <h4>Dispatched🚚 <span className="dispatched-no">({groupedOrders.DISPATCHED.length})</span></h4>
          </div>
        </div>

      </div>
      <div className="main orders-grid">
        {/* New Orders */}
        <div className="orders-column">
          <div className="new-order-header">
            <h3 id="new-h3">🕑New Order ({groupedOrders.NEW_ORDER.length})</h3>
            <button onClick={resetOrders} className="reset-button"> R </button>
          </div>
          <ul className="orders-container">
            {groupedOrders.NEW_ORDER.map((order) => (
              <li key={order.id} className="order-card order-new">
                <div className="order-header">
                  <span className="order-id">ORDER ID 00{order.id}</span>
                </div>

                <div className="customer-name">
                  👤{order.customer_name}
                </div>

                <div className="order-items">
                  {order.items.map((i) => (
                    <div key={i.id}>
                      {i.food_item_name} x{i.quantity}
                    </div>
                  ))}
                </div>

                <div className="order-actions">
                  <button
                    onClick={() => updateStatus(order.id, "COOKING")}
                    id="start-cooking"
                  >
                    Start Cooking
                  </button>
                </div>

                <div className="order-time">
                  Placed: {formatDate(order.created_at)}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Cooking */}
        <div className="orders-column">
          <h3 id="cooking-h3">🍳Cooking ({groupedOrders.COOKING.length})</h3>
          <ul className="orders-container">
            {groupedOrders.COOKING.map((order) => (
              <li key={order.id} className="order-card order-cooking">
                <div className="order-header">
                  <span className="order-id">ORDER ID 00{order.id}</span>
                  {timers[`order-${order.id}`] === 0 && (
                    <span className="overdue-alert">Overdue❗</span>
                  )}

                </div>

                <div className="customer-name">
                  👤{order.customer_name}
                </div>

                <div className="order-items">
                  {order.items.map((i) => {
                    const itemKey = `${order.id}-${i.id}`;
                    return (
                      <div key={i.id} className="order-item-row">
                        <span className="item-name">
                          {i.food_item_name} x{i.quantity}
                        </span>
                        <span className="item-timer">
                          {timers[itemKey] > 0 ? formatSeconds(timers[itemKey]) : `~${i.cook_time}:00`}
                        </span>


                      </div>
                    );
                  })}
                </div>

                <div className="order-actions">
                  <button
                    onClick={() => updateStatus(order.id, "READY")}
                    id="mark-ready"
                  >
                    Mark as Ready
                  </button>
                </div>

                <div className="order-time">
                  Placed: {formatDate(order.created_at)}
                </div>
              </li>
            ))}
          </ul>
        </div>


        {/* Ready */}
        <div className="orders-column">
          <h3 id="ready-h3">✅Ready ({groupedOrders.READY.length})</h3>
          <ul className="orders-container">
            {groupedOrders.READY.map((order) => (
              <li key={order.id} className="order-card order-ready">
                <div className="order-header">
                  <span className="order-id">ORDER ID 00{order.id}</span>
                </div>

                <div className="customer-name">
                  👤{order.customer_name}
                </div>

                <div className="order-items">
                  {order.items.map((i) => (
                    <div key={i.id}>
                      {i.food_item_name} x{i.quantity}
                    </div>
                  ))}
                </div>

                <div className="order-actions">
                  <button
                    onClick={() => updateStatus(order.id, "DISPATCHED")}
                    id="dispatch"
                  >
                    Dispatch
                  </button>
                </div>

                <div className="order-time">
                  Placed: {formatDate(order.created_at)}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

export default OrdersList;

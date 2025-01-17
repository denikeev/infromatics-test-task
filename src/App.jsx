/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  Container,
  Nav,
  Navbar,
  Button,
} from 'react-bootstrap';

import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.scss';
import arrow from './assets/img/arrow-right.svg';
import { initColl, shapesClasses, itemClasses } from './data.js';

const App = () => {
  const swipeCoords = useMemo(() => ({ touchStart: 0, touchEnd: 0 }), []);
  const [hexagons, setHexagons] = useState(initColl);
  const [shiftCount, setShiftCount] = useState(0);

  const switchHexagons = useCallback((direction, shift = null) => {
    if (shift === 0) {
      setHexagons(initColl);
      setShiftCount(0);
      return;
    }
    if (direction === 'top' && (shiftCount > 1 && shift === null)) return;
    if (direction === 'bottom' && (shiftCount < -1 && shift === null)) return;

    const typeMap = {
      top: 1,
      bottom: -1,
    };
    const symbol = typeMap[direction];
    const currentShift = shift ? shift - 1 : shiftCount;
    const clickShift = shift ? shift * symbol : shiftCount + symbol;
    const updatedHexagons = hexagons.map((hexagon, i) => {
      const shapeClass = shapesClasses[i + clickShift] || 'hexagons__shape_hide';
      const itemClass = [itemClasses[i + clickShift] || 'hexagons__item_width-null'];
      switch (direction) {
        case 'top':
          if (i === 0) {
            if (currentShift === 0) {
              itemClass.push('hexagons__item_mls');
            }
            if (currentShift === 1) {
              itemClass.push('hexagons__item_mlm');
            }
          }
          if (i === hexagons.length - 1 && currentShift === -2) {
            itemClass.push('hexagons__item_mrs');
          }
          break;
        case 'bottom':
          if (i === hexagons.length - 1) {
            if (currentShift === 0) {
              itemClass.push('hexagons__item_mrs');
            }
            if (currentShift === -1 || clickShift === -2) {
              itemClass.push('hexagons__item_mrm');
            }
          }
          if (i === 0 && currentShift === 2) {
            itemClass.push('hexagons__item_mls');
          }
          break;
        default:
          throw new Error(`Unknown direction ${direction}`);
      }

      return { ...hexagon, shapeClass, itemClass: itemClass.join(' ') };
    });
    setShiftCount(shift * symbol || shiftCount + typeMap[direction]);
    setHexagons(updatedHexagons);
  }, [hexagons, shiftCount]);

  useEffect(() => {
    const handleScroll = (e) => {
      if (e.deltaY > 0) {
        switchHexagons('top');
      }
      if (e.deltaY < 0) {
        switchHexagons('bottom');
      }
    };

    window.addEventListener('wheel', handleScroll);
    return () => window.removeEventListener('wheel', handleScroll);
  }, [hexagons, shiftCount, switchHexagons]);

  useEffect(() => {
    const handle = (event) => {
      const position = event.changedTouches[0].screenY;
      swipeCoords.touchStart = position;
    };

    window.addEventListener('touchstart', handle);

    return () => window.removeEventListener('touchstart', handle);
  }, [shiftCount, swipeCoords]);

  useEffect(() => {
    const handle = (event) => {
      const position = event.changedTouches[0].screenY;
      swipeCoords.touchEnd = position;
      const getDirection = () => {
        const { touchStart, touchEnd } = swipeCoords;
        if (Math.abs(touchStart - touchEnd) < 6) return null;

        return touchStart > touchEnd ? 'top' : 'bottom';
      };

      const direction = getDirection();
      if (direction === null) return;
      switchHexagons(getDirection());
    };

    window.addEventListener('touchend', handle);

    return () => window.removeEventListener('touchend', handle);
  }, [shiftCount, swipeCoords, switchHexagons]);

  return (
    <>
      <h1 className="visually-hidden">Билеты и абонементы</h1>
      <div className="app">
        <div className="diagonal-box">
          <ul className="hexagons">
            {hexagons.map((item) => (
              <li key={item.texts.date} className={`hexagons__item ${item.itemClass}`}>
                <div
                  onClick={() => switchHexagons(item.onClick.dir, item.onClick.shift)}
                  className={`hexagons__shape ${item.shapeClass}`}
                  onKeyDown={() => switchHexagons(item.onClick.dir, item.onClick.shift)}
                  role="button"
                  tabIndex="0"
                >
                  <div className="hexagons__texts">
                    <p className="hexagons__text hexagons__text_place">{item.texts.place}</p>
                    <p className="hexagons__text hexagons__text_date">
                      <span className="hexagons__text_date_full">{item.texts.date}</span>
                      <span className="hexagons__text_date_short">{item.texts.shortDate}</span>
                    </p>
                    <p className="hexagons__text hexagons__text_time">{item.texts.time}</p>
                    <Button className="hexagons__text hexagons__text_btn" variant="outline-dark">Купить билет</Button>
                  </div>
                </div>
                <div className="opponents">
                  <div className="opponents__item opponents__first"><span>{item.texts.firstOpponent}</span></div>
                  <div className="opponents__item opponents__second"><span>{item.texts.secondOpponent}</span></div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="circle" />
      </div>

      <Navbar expand="md" variant="dark" className="navbar-custom">
        <Container fluid className="px-md-5">
          <Navbar.Brand className="me-0 navbar-custom__link" href="#">БИЛЕТЫ И АБОНЕМЕНТЫ</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="flex-grow-1 text-center">
              <Nav.Link className="flex-grow-1" href="#1">Как купить?</Nav.Link>
              <Nav.Link className="flex-grow-1" href="#2">Правила</Nav.Link>
              <Nav.Link className="flex-grow-1" href="#3">Возврат билетов</Nav.Link>
            </Nav>
          </Navbar.Collapse>
          <a className="login navbar-custom__link text-decoration-none" href="#">
            <img src={arrow} alt="login" />
            <span className="d-none d-sm-block">Войти</span>
          </a>
        </Container>
      </Navbar>
    </>
  );
};

export default App;

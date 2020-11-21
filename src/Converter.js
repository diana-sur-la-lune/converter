import '../node_modules/bootstrap/dist/css/bootstrap.css';
import React, { Component } from 'react';
import moment from 'moment';
import { AllHtmlEntities } from 'html-entities';
import NumberFormat from 'react-number-format';

const entities = new AllHtmlEntities();
const INTERVAL = 1000 * 60;
const URL = 'https://api.coindesk.com/v1/bpi/currentprice.json';

class Converter extends Component {
  state = {
    btc: '',
    refreshDate: '',
    currencies: [],
    userCurrencies: [],
    newCurrencyIndex: 0,
  };

  componentDidMount() {

    this.refresh();
    setInterval(this.refresh, INTERVAL);
  }

  getAvailableCurrencies = (currencies, userCurrencies) => {
    const userCurenciesCodes = userCurrencies.map(item => item.code);
    const availableCurrencies = currencies.filter(item => !userCurenciesCodes.includes(item.code));
    return availableCurrencies;
  };

  refresh = () => {
    fetch(URL).then(async response => {
      const json = await response.json();
      const currencies = Object.keys(json.bpi).map(key => json.bpi[key]);
      const { userCurrencies } = this.state;
      const availableCurrencies = this.getAvailableCurrencies(currencies, userCurrencies);
      this.setState({
        refreshDate: json.time.updatedISO,
        currencies,
        newCurrencyIndex: 0,
      });
    });
  };


  render() {
    const { btc, refreshDate, currencies, userCurrencies, newCurrencyIndex } = this.state;

    const availableCurrencies = this.getAvailableCurrencies(currencies, userCurrencies);

    return (
      <div className="container">
        <div className="row justify-content-center text-center pt-5">
          <div className="col-6">
            <h1>Bitcoin Converter</h1>
            <div className="card card-body mt-2" >
              <div className="card-header mb-3">{`Last refresh: ${moment(refreshDate).format('YYYY-MM-DD HH:mm:ss')}`}</div>


              <div>
                <div className="input-group mb-3">
                  <div className="input-group-prepend">
                  <span class="input-group-text" id="basic-addon1">BTC</span>
                  </div>
                  <input
                    className="form-control" placeholder="Add amount of Bitcoins"
                    onChange={event => {
                      const { value } = event.target;
                      this.setState({ btc: value });
                    }}
                  />
                </div>
              </div>


              {userCurrencies.length > 0 && (
                <div>
                  {userCurrencies.map(item => {
                    const btcValue = Number.parseFloat(btc) || 0;
                    return (
                      <div className="row" key={`${item.code}-favorite`}>
                        <div className="col-lg-2 col-sm-3">
                        <div className="input-group-text my-2">
                        {`${item.code}`}
                         </div> 
                        </div>

                        <div className="col-lg-8 col-sm-7">
                        <div className="input-group-text my-2">
                        {`${entities.decode(item.symbol)}${(btcValue * item.rate_float).toFixed(2)}`} 
                        </div>
                        </div>

                      
                      
                      <div className="col-1">
                      <button type="button" class="btn btn-dark my-2"
                          onClick={() => {
                            const newUserCurerncies = userCurrencies.filter(
                              userCurrency => item.code !== userCurrency.code,
                            );
                            this.setState({ userCurrencies: newUserCurerncies });
                          }}>
                          X
                        </button>
</div>
</div>
                    );
                  })}
                </div>
              )}
              {userCurrencies.length > 0 }

              {availableCurrencies.length > 0 && (

                <div className="input-group mt-4">
                  <select
                    value={newCurrencyIndex}
                    placeholder="ddd"
                    className="form-control"
                    onChange={event => {
                      const { value } = event.target;
                      this.setState({ newCurrencyIndex: value });
                    }}>
                    {availableCurrencies.map((item, index) => (
                      <option key={`${item.code}-option`} value={index}>
                        {item.code}
                      </option>
                    ))}
                  </select>
                  <div className="btn btn-primary"
                    onClick={() => {
                      const newCurrency = availableCurrencies[newCurrencyIndex];
                      
                      this.setState({
                        userCurrencies: [...userCurrencies, newCurrency],
                        newCurrencyIndex: 0,
                      });
                    }}>
                    Add currency
                  </div>
                </div>



              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Converter;

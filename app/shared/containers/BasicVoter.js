// @flow
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { Menu, Segment } from 'semantic-ui-react';

import Producers from '../components/Producers';
import Wallet from '../components/Wallet';
import WalletLockState from '../components/Wallet/LockState';
import Stake from '../components/Stake';

import * as AccountsActions from '../actions/accounts';
import * as ChainActions from '../actions/chain';
import * as GlobalsActions from '../actions/globals';
import * as ProducersActions from '../actions/producers';
import * as SettingsActions from '../actions/settings';
import * as ValidateActions from '../actions/validate';
import * as WalletActions from '../actions/wallet';
import * as StakeActions from '../actions/stake';
import * as VoteProducerActions from '../actions/system/voteproducer';

import logo from '../../renderer/assets/images/greymass.png';

type Props = {
  actions: {
    getAccount: () => void,
    getGlobals: () => void,
    getInfo: () => void
  },
  keys: {},
  settings: {},
  validate: {},
  wallet: {}
};

class BasicVoterContainer extends Component<Props> {
  props: Props;

  state = {
    activeItem: 'producers',
  };

  componentDidMount() {
    // Validate settings on app start
    const {
      actions,
      settings,
      validate
    } = this.props;
    // Always validate the node on startup
    actions.validateNode(settings.node);
    if (!validate.ACCOUNT || validate.ACCOUNT !== 'SUCCESS') {
      actions.validateAccount(settings.account);
    }
    this.tick();
    this.interval = setInterval(this.tick.bind(this), 15000);
  }

  componentWillReceiveProps(nextProps) {
    const { validate } = this.props;
    const nextValidate = nextProps.validate;
    if (
      validate.NODE === 'PENDING'
      && nextValidate.NODE === 'SUCCESS'
    ) {
      this.tick();
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  tick() {
    const {
      actions,
      settings,
      validate
    } = this.props;
    const {
      getGlobals,
      getInfo,
      getAccount
    } = actions;
    if (validate.NODE === 'SUCCESS') {
      getGlobals();
      getInfo();
      if (validate.ACCOUNT === 'SUCCESS') {
        getAccount(settings.account);
      }
    }
  }

  handleItemClick = (e, { name }) => this.setState({ activeItem: name })

  render() {
    console.log(this)
    const {
      activeItem
    } = this.state;
    const {
      keys,
      wallet
    } = this.props;
    let activeTab = <Producers {...this.props} />;
    switch (activeItem) {
      case 'stake': {
        activeTab = <Stake {...this.props} />;
        break;
      }
      case 'wallet': {
        activeTab = <Wallet {...this.props} />;
        break;
      }
      default: {
        break;
      }
    }
    //
    // const panes = [
    //   // {
    //   //   menuItem: { key: 'producers', icon: 'check square', content: 'Producer Voting' },
    //   //   render: () => (
    //   //     <Tab.Pane key="producers" style={{ marginTop: '3em' }}>
    //   //       <Producers {...this.props} />
    //   //     </Tab.Pane>
    //   //   )
    //   // },
    //   // {
    //   //   menuItem: { key: 'stake', icon: 'microchip', content: 'Stake' },
    //   //   render: () => (
    //   //     <Tab.Pane key="stake" style={{ marginTop: '3em' }}>
    //   //       <Stake {...this.props} />
    //   //     </Tab.Pane>
    //   //   )
    //   // },
    //   {
    //     menuItem: { key: 'wallet', icon: 'protect', content: 'Wallet' },
    //     render: () => (
    //       <Tab.Pane key="wallet" style={{ marginTop: '3em' }}>
    //         <Wallet {...this.props} />
    //       </Tab.Pane>
    //     )
    //   },
    //   {
    //     menuItem: (
          // <Menu.Menu position="right">
          //   <WalletLockState
          //     key="lockstate"
          //     keys={keys}
          //     wallet={wallet}
          //   />
          //   <Menu.Item key="about" position="right">
          //     <img alt="Greymass" src={logo} />
          //   </Menu.Item>
          // </Menu.Menu>
    //     ),
    //     render: () => (
    //       <Tab.Pane key="about" style={{ marginTop: '3em' }}>
    //         about area
    //       </Tab.Pane>
    //     )
    //   }
    // ];
    return (
      <div>
        <Menu
          attached
          inverted
          size="large"
        >
          <Menu.Item
            name="producers"
            icon="check square"
            content="Producer Voting"
            active={activeItem === 'producers'}
            onClick={this.handleItemClick}
          />
          <Menu.Item
            name="stake"
            icon="microchip"
            content="Stake"
            active={activeItem === 'stake'}
            onClick={this.handleItemClick}
          />
          <Menu.Item
            name="wallet"
            icon="protect"
            content="Wallet"
            active={activeItem === 'wallet'}
            onClick={this.handleItemClick}
          />
          <Menu.Menu position="right">
            <WalletLockState
              key="lockstate"
              keys={keys}
              wallet={wallet}
            />
            <Menu.Item
              name="about"
              position="right"
              active={activeItem === 'about'}
              onClick={this.handleItemClick}
            >
              <img alt="Greymass" src={logo} />
            </Menu.Item>
          </Menu.Menu>
        </Menu>
        <Segment
          attached="bottom"
          basic
        >
          {activeTab}
        </Segment>

      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    accounts: state.accounts,
    balances: state.balances,
    chain: state.chain,
    globals: state.globals,
    keys: state.keys,
    producers: state.producers,
    settings: state.settings,
    validate: state.validate,
    wallet: state.wallet
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...AccountsActions,
      ...ChainActions,
      ...GlobalsActions,
      ...ProducersActions,
      ...SettingsActions,
      ...ValidateActions,
      ...WalletActions,
      ...StakeActions,
      ...VoteProducerActions
    }, dispatch)
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(BasicVoterContainer));

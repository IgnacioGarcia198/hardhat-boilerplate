// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.17;

import "./Ownable.sol";
 
contract TestContract is Ownable
{
  uint public counter = 0;
 
  constructor()
  {
    //IncrementCounter();
  }
 
  function IncrementCounter() public
  {
    counter ++;
    emit CounterIncreased(counter);
  }

  function GetCounter() public view returns (uint) {
    return counter;
  }

  function kill() public onlyOwner {
    selfdestruct(payable(owner()));
  }

  event CounterIncreased(uint newCount);
}
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import { IERC20 } from "./interfaces/IERC20.sol";


contract CallHelper {
    event Response(bool success, bytes data);
    event FailedResonse(string data);

    address payable public routeProcessor;

    constructor(address _routeProcessor) {
        routeProcessor = payable(_routeProcessor);
    }

    function testCallERC20(address tokenAddr, uint256 amount, bytes calldata callData) public payable {
        IERC20 token = IERC20(tokenAddr);
        token.transferFrom(msg.sender, address(this), amount);
        token.approve(routeProcessor, amount);
        // You can send ether and specify a custom gas amount
        (bool success, bytes memory data) = routeProcessor.call{
            value: msg.value
        }(callData);

        emit Response(success, data);
        
        if(!success) {
            emit FailedResonse(string(data));
        }
        
    }

    function testCallNative(bytes calldata callData) external payable {
        // You can send ether and specify a custom gas amount
        (bool success, bytes memory data) = routeProcessor.call{
            value: msg.value
        }(callData);

        emit Response(success, data);
         if(!success) {
            emit FailedResonse(string(data));
        }
    }
    
    /// @notice For native unwrapping
    receive() external payable {}
    fallback() external payable {}
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IVerifier
{
    function verify(bytes memory signature_, address sender_, uint256 salt_, uint256 expiration_) external view returns (bool);
    function updateSigner(address signer_) external;
}
